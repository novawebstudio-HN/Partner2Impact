# Partner2Impact — website

The 2026 refresh of [partner2impact.com](https://partner2impact.com), repositioned around a
single audience and a single value proposition: **nonprofits using data to improve their
fundraising.**

Plain HTML, CSS and vanilla JavaScript — no build step, no framework, no dependencies. Drop
the folder on any static host and it works.

---

## Where the content comes from

All copy follows Tracey's brand brief (the Gemini planning session, `Website Refresh for
Nonprofit Data`). None of the pre-2026 website copy was carried over — that was an explicit
requirement.

The positioning: 20+ years of nonprofit fundraising strategy (Tracey Wiseman) combined with
predictive data intelligence (David Galvin, *"data is currency"*). Headline, pain points,
solution grid, Extract/Enrich/Execute, bios, and the lead-capture form all come from the
approved copy in that brief.

## Pages

| File | Public URL | Purpose |
| --- | --- | --- |
| `index.html` | `/` | Dark hero with the logo lockup and the four signals, the goldmine section, solution grid, data-as-currency, partners, CTA |
| `tool.html` | `/tool` | The Data Tool — scoring, prospect discovery, the dashboard view, how it fits your CRM |
| `consulting.html` | `/consulting` | Consulting & Strategy — campaigns, alignment, pipeline growth |
| `about.html` | `/about` | Tracey & David, why the partnership, track record, FAQ |
| `contact.html` | `/contact` | 15-minute data health check request form |
| `404.html` | — | Not-found page |

**Clean URLs.** Every internal link, canonical and sitemap entry uses the extensionless
form — `/tool`, never `/tool.html`, and `/` rather than `/index.html`. GitHub Pages resolves
`/tool` to `tool.html` on its own, so this needs no rewrite rules and no build step. The
`.html` URLs still resolve for anyone holding an old link; the canonical on each page points
at the clean form so only one version is indexed.

Because the links are now root-absolute, the site expects to be served from a domain root.
That is what `partner2impact.com` gives it. Deploying to a subdirectory again would mean
reverting the links to relative form.

The previous `services.html` and `clients.html` are gone. The client list survives, trimmed
to nonprofit-sector organizations, as a track-record block inside `about.html`.

## Project structure

```
.
├── index.html  tool.html  consulting.html  about.html  contact.html  404.html
├── robots.txt  sitemap.xml  favicon.ico  site.webmanifest
├── google-apps-script/    # contact-form backend for Google Sheets
├── assets/
│   ├── css/
│   │   ├── fonts.css      # @font-face for the self-hosted webfonts
│   │   └── styles.css     # design system + all component styles
│   ├── fonts/             # Plus Jakarta Sans + Inter, woff2, latin & latin-ext
│   ├── img/               # logo variants, headshots, favicon
│   └── js/
│       └── main.js        # nav, scroll reveal, form handling
└── Parnet2Impact Assets/  # original source files as supplied
```

## The hero and the four signals

The hero is a single dark section: headline, actions, and Tracey's four signals underneath.
The signals are the hero's visual payload, so there is **one** headline at the top of the
page rather than two competing ones.

The signals are a rebuild of Tracey's "Fusion of Predictive Data and Strategy" graphic. Her
wording is kept verbatim — major gift prospects, lapse risk, upgrade donors, new prospects,
plus the "empowering nonprofit fundraising" footnote. The AI-generated artwork is not used.

Built from CSS and inline SVG rather than an image: crisp at any size, no image request,
reflows to one column on mobile, and the text is real text (selectable, translatable,
indexable). Each card carries a five-bar mini chart — rising for the three opportunity
signals, falling for lapse risk, because that is the shape of the thing being described.
Lapse risk is also the one amber card, matching what amber means everywhere else on the site.

The donor-intelligence dashboard now lives on `tool.html`, where a product view belongs,
with a caption stating that the figures are illustrative.

## Logo variants

The 2026 mark is teal + orange + navy, supplied as a single 1536×1024 PNG on a white
background. `assets/img/` holds the derivatives the pages actually use; all of them are
generated from `Parnet2Impact Assets/logo.png` and can be regenerated from it.

| File | Where it is used |
| --- | --- |
| `logo-mark.webp` | Header. Cropped above the "Data-Driven Fundraising" line, which is illegible at header size |
| `logo-light-*.webp` | Anything on navy — footer, closing CTA band. Neutral dark pixels lifted to near-white so the wordmark reads; teal and orange untouched |
| `logo-light-hero.webp` | Hero lockup at 2× |
| `logo.png` / `logo-800.webp` | Flat white-background versions for `og:image` |

The white background was keyed out to alpha by chroma, not by a flat threshold: the navy
wordmark has *high relative* saturation because its channel values are all small, so a
naive saturation test classifies it as brand colour and leaves it dark. Chroma
(`max − min`) separates it correctly from the teal and orange.

On the homepage the logo now appears in the header, the hero, the closing CTA band and the
footer.

## Favicon and app icons

The full lockup is unusable at favicon size — three words and a tagline collapse into a
smudge. The icon reduces the mark to its dominant element instead: the four ascending bars,
three teal and the fourth orange, on the site's navy. Same shape, same colours, legible at
16px.

The arrow that sweeps over the bars in the logo was tried and dropped. At 16px its stroke
lands under one pixel and the head turns the top-right corner to mush; the bars alone read
cleanly at every size.

| File | Purpose |
| --- | --- |
| `favicon.ico` (repo root) | 16 / 32 / 48 in one file. Browsers and Google request `/favicon.ico` by default whether or not a `<link>` says so — without it the tab falls back to a grey letter tile |
| `assets/img/favicon.svg` | Vector, used by browsers that prefer it. Crisp on high-DPI and at any zoom |
| `assets/img/icon-180.png` | `apple-touch-icon`, square-cornered because iOS applies its own rounding |
| `assets/img/icon-192/512.png` | Android home screen, via `site.webmanifest` |

Colours are sampled from the supplied logo (teal `#01918b`, orange `#fc7902`) and snapped to
the site's `--teal-bright` / `--amber` neighbours so the icon matches the rest of the UI.

Regenerate all five from the geometry in one pass — the shapes are defined in a 64-unit
space and drawn at 8× before downsampling, since Pillow's primitives are not antialiased.

## Design system

Palette from the brand brief, with one deliberate adjustment:

| Token | Value | Use |
| --- | --- | --- |
| `--navy` / `--navy-900` | `#0f172a` / `#020617` | Trust, authority — dark sections and text |
| `--teal-bright` | `#0d9488` | Brief's data-science colour — **graphics, fills and borders only** |
| `--teal` / `--teal-600` | `#0f766e` / `#115e59` | Same hue, darkened — used wherever text sits on or in it |
| `--amber-bright` | `#d97706` | Brief's "currency" accent — **graphics only** |
| `--amber` / `--amber-600` | `#b45309` / `#92400e` | Darkened — primary CTA buttons |
| `--sand` | `#f8fafc` | Soft slate backgrounds |

**Why the split:** the brief's `#0d9488` and `#d97706` measure 3.74:1 and 3.19:1 against
white, below the 4.5:1 WCAG AA threshold for text. White button labels on those backgrounds
would be hard to read. The bright shades are kept for anything purely visual; text and
button surfaces use the darker pair. Visually the brand reads the same; every text pairing
on the site now measures 5:1 or better.

Typography is Plus Jakarta Sans (display) and Inter (body), both named in the brief and both
self-hosted.

## Running it locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Serve over HTTP rather than opening files directly — browsers block self-hosted fonts over
`file://`.

## Publishing

Nothing to compile. Three routes, in order of preference:

1. **Static host + GoDaddy domain** — deploy to GitHub Pages, Netlify or Cloudflare Pages
   and point the existing GoDaddy DNS at it. The domain never moves.
2. **GoDaddy cPanel / Web Hosting** — upload the folder over FTP. Stays entirely within
   GoDaddy, but note this is a different product from GoDaddy Website Builder.
3. **GoDaddy Website Builder** — not compatible. The builder does not accept custom
   HTML/CSS, so the site would have to be rebuilt inside its block editor and would lose
   this layout.

`404.html` uses absolute asset paths (`/assets/…`) so it works from any URL depth. The five
main pages keep relative asset paths, which resolve correctly under the extensionless URLs
because none of them carries a trailing slash — `/tool` has `/` as its base, so
`assets/css/styles.css` still lands on `/assets/css/styles.css`.

### Redirects from the 2020 site

Google still has the old site's URLs indexed, and none of them exist in the rebuild, so
every search result led to the 404 page. Five stub files cover them:

| Old URL | Goes to |
| --- | --- |
| `/home` | `/` |
| `/about-1` | `/about` |
| `/services` | `/consulting` |
| `/client-list` | `/about` |
| `/contact-us` | `/contact` |

Static hosting cannot issue a real 301, so each stub combines `<meta http-equiv="refresh">`,
a JavaScript `location.replace` that preserves any `#hash`, a `canonical` pointing at the
destination, and `noindex` so the stub itself never enters the index. Search engines treat
the canonical as the consolidation signal and fold the old URL into the new one.

They are deliberately absent from `sitemap.xml` — a sitemap should list destinations, not
redirects.

### GitHub Pages notes

`.nojekyll` at the repository root tells Pages to serve the files as they are instead of
running them through Jekyll. This site is plain static HTML, so the Jekyll pass buys nothing
and brings its conventions along — most notably that Jekyll silently drops any file or
directory whose name starts with an underscore.

If a deployment ever hangs (GitHub's `pages build and deployment` run stuck on the `deploy`
job while `build` succeeded), cancel that run and push any commit to `main`; the merge
triggers a fresh build and deploy. Switching Pages to the "GitHub Actions" source and
committing an explicit workflow would also add a manual re-run button, but that is a
repository setting change, not a code change.

## Wiring up the form

The form works with no backend: on submit it opens the visitor's mail client with the
message pre-filled and addressed to `Hello@Partner2Impact.com`.

To deliver submissions somewhere instead, set the endpoint in `assets/js/main.js`:

```js
var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfy…/exec';
```

### Google Sheet via Apps Script (the chosen route)

`google-apps-script/Code.gs` is the backend. Paste it into the sheet's Apps Script editor
and deploy it as a web app — the file's header comment carries the click-by-click steps. It
appends one row per submission and emails `Hello@Partner2Impact.com`.

The sheet's header row is written automatically on the first submission, in this order:

| Timestamp | Name | Organization | Email | Phone | CRM | Primary challenge | Message | Consent | Source page |

Details worth knowing:

- **The body is sent as `FormData`, deliberately.** `multipart/form-data` is a
  CORS-safelisted content type, so the browser skips the preflight `OPTIONS` request. Apps
  Script cannot answer `OPTIONS`, so sending JSON instead would fail before it ever reached
  the script.
- **Apps Script always answers HTTP 200**, even on failure, so `res.ok` proves nothing. The
  outcome travels in the JSON body and the site reads `result` to decide what to show. A
  service that signals through the status code alone and returns no body still works — a
  missing body is treated as success.
- **A leading `=`, `+`, `-` or `@` in visitor text is prefixed with an apostrophe** before it
  reaches the sheet, so a pasted value cannot be evaluated as a formula.
- **Writes are wrapped in a `LockService` lock**, so two submissions landing at once cannot
  race for the same row.
- **A failed notification email never loses the row.** The send is caught separately, after
  the append has already committed.

Redeploying is the step people miss: after editing `Code.gs`, use *Deploy → Manage
deployments → edit → Version: New version*. Saving alone does not update the live web app.

### Other services

Any service accepting a `FormData` POST works — Formspree, Basin, Netlify Forms, HubSpot, or
a custom handler. Client-side validation, the honeypot spam trap, and the success and error
states are already in place. The form posts `name`, `organization`, `email`, `phone`, `crm`,
`challenge`, `message`, `consent` and `page`.

For live booking, a Calendly (or similar) link can replace the `contact.html#audit` targets
in the navigation and CTA bands.

## Technical

- Responsive from 320px; verified for zero horizontal overflow at 360 / 390 / 768 / 1440
- Self-hosted webfonts — no third-party requests anywhere on the site
- Images in WebP with JPEG fallbacks; the 17 MB source headshot serves at 20–100 KB
- Accessibility: skip link, landmarks, visible focus rings, labelled fields with inline
  errors, `aria-current` nav, WCAG AA text contrast throughout
- The hero and the tool dashboard are built in CSS and inline SVG — no image requests, and
  the dashboard carries an `aria-label` describing it for screen readers
- Text contrast on the dark hero was measured against the darkest gradient stop, not the
  average, so every pairing holds at the worst point (lowest is 5.25:1)
- `prefers-reduced-motion` disables all animation
- SEO: per-page titles and descriptions, canonicals, Open Graph, `ProfessionalService`
  structured data, `sitemap.xml`, `robots.txt`

## What the site must not claim

**No "real time".** David confirmed the tool cannot do real-time updates, so advertising it
would be selling something that does not exist. Every instance was removed — the homepage
solution list, the `tool.html` capability section and its meta descriptions, the goldmine
paragraph and David's line in the about page. The homepage item that read *"Real-time donor
updates"* is now *"Hidden major donors"*.

Keep this in mind for any new copy: the tool re-reads records against fresh signals on a
cadence, it does not stream them live.

## Open items before launch

These need Tracey's confirmation — they are claims or assets the site presents as fact:

1. **The dashboard on `tool.html` is illustrative.** The figures ($2.4M portfolio, the donor
   names and scores) are invented placeholders showing the shape of the output. A visible
   caption says so. If the real tool looks different, swap in a screenshot.
2. **"Secure major gifts / capital campaigns"** in Tracey's bio comes from the brief. Worth
   confirming the wording matches what she wants to claim publicly.
3. **David's title** is **Decision Intelligence Lead** throughout, per Tracey. The old
   site's "public outreach strategist, Emmy Award–winning writer and producer" is no longer
   mentioned anywhere — confirm that is intended.
4. **The tool has no product name** on the site. If it gets one, it should replace the
   generic "the tool" references.
5. **David's headshot is the old one.** Tracey supplied a newer photo, but only in black
   and white, and asked for colour. It needs the original colour file from David — a
   black-and-white photo cannot be recoloured back to the truth, only invented. Until that
   arrives the site keeps the existing colour headshot.
6. **Contact email** — `Hello@Partner2Impact.com`, carried from the old site. Confirm it is
   still monitored.
7. **CRM list** on the homepage and in the form dropdown is a reasonable default set. Trim or
   extend it to the systems the tool actually integrates with.
