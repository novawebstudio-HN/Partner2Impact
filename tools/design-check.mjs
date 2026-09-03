#!/usr/bin/env node
/**
 * Design check — renders the site in a real browser and measures it.
 *
 *   node tools/design-check.mjs            # audit only
 *   node tools/design-check.mjs --shots    # also save screenshots to tools/shots/
 *   node tools/design-check.mjs --port 9000
 *
 * Checks, in order of how often they have actually caught something:
 *
 *   1. Contrast, sampled from rendered pixels. Every text run is measured
 *      against the pixel actually painted behind it, captured in a second pass
 *      with all text set to transparent. Reasoning about the cascade instead
 *      gives wrong answers — gradients, translucent card fills and stacked
 *      overlays all compose in ways that are painful to predict and trivial
 *      to photograph.
 *   2. Horizontal overflow at four widths. A single element a few pixels too
 *      wide makes the whole page scroll sideways on a phone.
 *   3. Console and page errors.
 *
 * Needs Playwright: cd tools && npm install
 *
 * If the environment already ships a browser, point at it and skip the
 * download: CHROME_PATH=/path/to/chrome node tools/design-check.mjs
 */
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PAGES = ['index', 'tool', 'consulting', 'hyper-targeting', 'about', 'contact', '404'];
const WIDTHS = [360, 390, 768, 1440];
const SHOTS = process.argv.includes('--shots');
const PORT = Number(process.argv[process.argv.indexOf('--port') + 1]) || 8123;

const MIME = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp',
  '.woff2':'font/woff2', '.ico':'image/x-icon', '.xml':'application/xml',
  '.json':'application/json', '.webmanifest':'application/manifest+json' };

/* GitHub Pages resolves /tool to tool.html; the local server has to match or
   every clean URL 404s and the audit measures error pages. */
function serve() {
  return new Promise(ok => {
    const s = createServer(async (req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      let file = join(ROOT, p);
      if (!existsSync(file) && existsSync(file + '.html')) file += '.html';
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
        res.end(body);
      } catch { res.writeHead(404); res.end('not found'); }
    });
    s.listen(PORT, () => ok(s));
  });
}

const lum = ([r, g, b]) => {
  const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const server = await serve();
/* CHROME_PATH lets a sandbox with a pre-installed browser point at it instead
   of the build Playwright would download. Unset, the default applies. */
const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const base = `http://127.0.0.1:${PORT}`;
const errors = [], overflow = [], failures = [];
let tightest = { r: Infinity };
if (SHOTS) await mkdir(join(ROOT, 'tools/shots'), { recursive: true });

for (const name of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  /* A third-party script that will not load is not this site's bug, and the
     audit runs against a local server that cannot speak for someone else's
     CDN. Network failures naming an external host are dropped; everything
     from our own origin, and every page error, still counts. */
  const ownOrigin = url => /^https?:\/\/(localhost|127\.0\.0\.1)/.test(url || '');

  page.on('console', m => {
    if (m.type() !== 'error') return;
    const text = m.text();
    /* Chromium leaves the URL out of the message text for a failed subresource
       and puts it in the location instead, so the host has to come from there. */
    const isNetwork = /Failed to load resource|net::ERR_/.test(text);
    if (isNetwork && !ownOrigin(m.location()?.url)) return;
    errors.push(`${name}: ${text}${isNetwork ? ` (${m.location()?.url})` : ''}`);
  });
  page.on('requestfailed', r => {
    const url = r.url();
    if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(url)) {
      errors.push(`${name}: request failed ${url} (${r.failure()?.errorText})`);
    }
  });
  page.on('pageerror', e => errors.push(`${name} PAGEERROR: ${e.message}`));
  await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  /* Reveal-on-scroll elements are invisible until observed; force them so the
     audit sees the finished page rather than a blank one. */
  await page.evaluate(() => document.querySelectorAll('[data-reveal]')
    .forEach(e => e.classList.add('is-visible')));
  await page.waitForTimeout(350);

  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(200);
    const over = await page.evaluate(() => {
      const d = document.documentElement;
      if (d.scrollWidth <= window.innerWidth) return null;
      const guilty = [...document.querySelectorAll('*')]
        .filter(el => el.getBoundingClientRect().right > window.innerWidth + 1)
        .slice(0, 3)
        .map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).join('.') : ''));
      return { by: d.scrollWidth - window.innerWidth, guilty };
    });
    if (over) overflow.push(`${name} @${w}px: +${over.by}px — ${over.guilty.join(', ')}`);
    if (SHOTS && (w === 390 || w === 1440))
      await page.screenshot({ path: join(ROOT, `tools/shots/${name}-${w}.png`), fullPage: true });
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(200);

  const items = await page.evaluate(() => {
    const nums = s => (s.match(/[\d.]+/g) || []).map(Number);
    const out = [];
    document.querySelectorAll('p,h1,h2,h3,h4,a,span,li,label,cite,summary,button,td,th')
      .forEach(el => {
        /* The skip link sits off-screen until focused; sampling it reads the
           page behind it and reports a failure that does not exist. */
        if (!el.offsetParent || el.closest('.skip-link')) return;
        /* offsetParent is still set on a visibility:hidden or opacity:0
           subtree — a closed dropdown, say — so those have to be excluded
           separately or they get measured against whatever is painted behind
           them. */
        for (let n = el; n; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.visibility === 'hidden' || cs.visibility === 'collapse') return;
          if (parseFloat(cs.opacity) === 0) return;
        }
        const text = [...el.childNodes].filter(n => n.nodeType === 3)
          .map(n => n.textContent.trim()).join('');
        if (!text) return;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return;
        const cs = getComputedStyle(el);
        const fg = nums(cs.color);
        if (fg.length < 3) return;
        const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight) || 400;
        out.push({
          text: text.slice(0, 44),
          fg: fg.slice(0, 3), alpha: fg.length === 4 ? fg[3] : 1,
          x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY),
          w: Math.round(r.width), h: Math.round(r.height),
          large: size >= 24 || (size >= 18.66 && weight >= 700)
        });
      });
    return out;
  });

  await page.evaluate(() => {
    const s = document.createElement('style');
    s.textContent = '*{color:transparent!important;text-shadow:none!important;' +
                    '-webkit-text-fill-color:transparent!important}';
    document.head.appendChild(s);
  });
  await page.waitForTimeout(250);
  const shot = (await page.screenshot({ fullPage: true })).toString('base64');

  /* Sampling happens in the page via canvas so the script needs no image
     decoder of its own. */
  const sampled = await page.evaluate(async ({ shot, items }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + shot;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    return items.map(it => {
      const pts = [];
      for (const fx of [0.12, 0.5, 0.88]) for (const fy of [0.25, 0.5, 0.75]) {
        const x = Math.min(img.width - 1, Math.max(0, Math.round(it.x + it.w * fx)));
        const y = Math.min(img.height - 1, Math.max(0, Math.round(it.y + it.h * fy)));
        pts.push([...ctx.getImageData(x, y, 1, 1).data].slice(0, 3));
      }
      return { ...it, pts };
    });
  }, { shot, items });

  for (const it of sampled) {
    const need = it.large ? 3 : 4.5;
    let worst = Infinity;
    for (const bg of it.pts) {
      const eff = it.fg.map((v, i) => Math.round(v * it.alpha + bg[i] * (1 - it.alpha)));
      worst = Math.min(worst, contrast(eff, bg));
    }
    const rec = { page: name, text: it.text, r: +worst.toFixed(2), need };
    if (worst < need) failures.push(rec);
    else if (worst - need < tightest.r - (tightest.need ?? 0)) tightest = rec;
  }
  await page.close();
}

await browser.close();
server.close();

const line = s => console.log(s);
line('');
line(`Pages: ${PAGES.length}   Widths: ${WIDTHS.join(' / ')}`);
line('');
line(`Console errors     ${errors.length === 0 ? 'none' : errors.length}`);
errors.slice(0, 8).forEach(e => line(`   ${e}`));
line(`Horizontal overflow ${overflow.length === 0 ? 'none' : overflow.length}`);
overflow.slice(0, 8).forEach(o => line(`   ${o}`));
line(`Contrast failures   ${failures.length === 0 ? 'none' : failures.length}`);
failures.sort((a, b) => a.r - b.r).slice(0, 12)
  .forEach(f => line(`   ${f.r}:1 (needs ${f.need})  [${f.page}]  "${f.text}"`));
if (!failures.length && tightest.text)
  line(`   tightest passing pair ${tightest.r}:1 (needs ${tightest.need}) [${tightest.page}] "${tightest.text}"`);
if (SHOTS) line(`\nScreenshots in tools/shots/`);
line('');

const clean = !errors.length && !overflow.length && !failures.length;
line(clean ? 'all clean' : 'ISSUES FOUND');
process.exit(clean ? 0 : 1);
