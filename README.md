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

The positioning: 30+ years of nonprofit fundraising strategy (Tracey Wiseman) combined with
predictive data intelligence (David Galvin, *"data is currency"*). Headline, pain points,
solution grid, Extract/Enrich/Execute, bios, and the lead-capture form all come from the
approved copy in that brief.

## Pages

| File | Public URL | Purpose |
| --- | --- | --- |
| `index.html` | `/` | Dark hero with the logo lockup and the four signals, the goldmine section, solution grid, data-as-currency, partners, CTA |
| `tool.html` | `/tool` | The Data Tool — scoring, prospect discovery, the dashboard view, how it fits your CRM |
| `consulting.html` | `/consulting` | Consulting & Strategy — campaigns, alignment, pipeline growth |
| `hyper-targeting.html` | `/hyper-targeting` | Hyper-targeted outreach — three capabilities, in Tracey's wording |
| `about.html` | `/about` | Tracey & David, why the partnership, track record, FAQ |
| `contact.html` | `/contact` | Calendly booking widget, email, quote |
| `privacy.html` | `/privacy` | Privacy Policy |
| `terms.html` | `/terms` | Terms and Conditions |
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
├── index.html  tool.html  consulting.html  hyper-targeting.html
├── about.html  contact.html  404.html
├── robots.txt  sitemap.xml  favicon.ico  site.webmanifest
├── google-apps-script/    # contact-form backend for Google Sheets
├── tools/                 # dev-only: design-check.mjs (the site has no deps)
├── assets/
│   ├── css/
│   │   ├── fonts.css      # @font-face for the self-hosted webfonts
│   │   └── styles.css     # design system + all component styles
│   ├── fonts/             # Plus Jakarta Sans + Inter, woff2, latin & latin-ext
│   ├── img/               # logo SVGs, app icons, headshots
│   └── js/
│       └── main.js        # nav, scroll reveal, form handling
└── Parnet2Impact Assets/  # original source files as supplied
```

## The hero and the four signals

The hero is a single dark section and holds one idea: logo, headline, lede, and the
15-minute button. Nothing else.

**The signals are their own white section, directly below it.** They started inside the hero
as its visual payload, and Tracey turned that down — not the cards themselves but the cards
on the navy. Moving them out gives the hero a single job and lets the panel run navy → white
→ sand down the page. Everything about the card inverts with the move: white surfaces on
`--line` borders, `--ink` headings, and the accent pair steps down from the dark-background
`--teal-400` / `--amber-400` to `--teal` / `--amber`.

That accent split is worth knowing before touching it. `--accent` fills the icon and
`--accent-ink` sets the kicker, and they differ because the hue that carries a 3rem icon tile
is not the one that clears AA as 0.7rem text over a 10% wash of itself.

The four items are Tracey's, from her "Fusion of Predictive Data and Strategy" graphic. Her
wording is verbatim — major gift prospects, lapse risk, upgrade donors, new prospects. The
AI-generated artwork is not used.

**There are no charts in these cards, and that is the finished answer rather than a gap.**
Two rounds tried to draw the signals: first the same five-bar chart on all four, then a
different drawing per card — a scatter of donors, a declining line with a recovery branch,
a climb between giving tiers, prospects converging on a mission. Tracey rejected both. The
second round is the more useful lesson: the drawings were individually defensible and still
wrong, because each one needed a caption to be understood. A graphic that has to be explained
is not carrying meaning, it is occupying space, and four of them side by side read as filler
no matter how carefully each is composed. We have no real figures to plot here, and inventing
some to fill the cards would be worse than leaving them out.

So the card is icon, category, title, sentence — and nothing else. The icon grew to 3rem and
leads the card instead of floating in a corner; the category left its pill and became a
kicker, which drops a whole visual layer without dropping any of Tracey's words. Hover fills
the icon solid with the accent and draws a hairline across the top. That is the entire
interaction, and it is enough: the cards are being picked out, not performing.

The section also gained the headline it never had. The two uppercase lines that used to
bracket the cards were captions on Tracey's slide, and on a web page they read as orphaned
text. "Empowering nonprofit fundraising" is now the section eyebrow. "Fusion of predictive
data and strategy" is gone: with a real headline above the cards, a second brand line below
them is one too many. **The headline itself — "Four things your database already knows" — is
new copy and needs Tracey's sign-off.** It makes no claim the site does not already make, but
it is the only line in this section she did not write.

The donor-intelligence dashboard now lives on `tool.html`, where a product view belongs,
with a caption stating that the figures are illustrative.

## Logo

The 2026 mark is supplied as four SVGs, one per background. Using the wrong one is the
mistake worth guarding against: the light version's wordmark is `#061E4F`, which on the navy
hero is very nearly invisible.

| File | Where it goes |
| --- | --- |
| `logo.svg` | Full lockup with the tagline, for light backgrounds |
| `logo-compact.svg` | Header only. Same lockup with `rule` and `tagline` stripped and the viewBox back to 460 |
| `logo-reverse.svg` | Hero, closing CTA band, footer — anything on navy |
| `logo-mono-white.svg`, `logo-mono-navy.svg` | Single-colour fallbacks. Not used on the site; kept for print and third-party placements |

`logo-reverse.svg` is the right choice on dark, not the plain white monogram: it keeps the
orange `2` and the teal `IMPACT`, which are what make the mark recognisable. Rendered
side by side on the real hero gradient, the mono-white version reads cleanly but generically.

Rasters are only generated where a vector cannot be used:

| File | Why raster |
| --- | --- |
| `og-image.jpg` | Social cards do not render SVG. 1200×630, logo on the hero gradient |
| `logo-1200.png` | `schema.org` `logo` expects a raster URL |

The lockup carries the tagline: five paths, not three — `wordmark`, `impact`, `accent`, plus
`rule` (the orange line) and `tagline`. It measures 2.04:1, taller than the 2.90:1 version
without the tagline, so every slot was resized again.

**The tagline sets the minimum size**, not the wordmark. Below roughly 58px of total height
it stops being readable — and a header tall enough to clear that bar makes the nav ungainly.
So the header uses `logo-compact.svg` instead: the same lockup with the `rule` and `tagline`
removed, which lets the bar go back to a normal height with the wordmark still large.

That split is the usual convention rather than a compromise — small placements drop the
tagline, large ones keep it. The hero, closing CTA band and footer all carry the full lockup,
where the tagline reads comfortably.

The tagline is `#6B7C93`, which measures 4.26:1 on white — under the 4.5:1 threshold that
would apply to body text. It is exempt: WCAG places no contrast requirement on text that
forms part of a logo. Worth knowing rather than "fixing", since altering it would mean
altering the supplied brand asset.

The favicon did not need regenerating: the `wordmark` path is byte-identical between the two
lockups, so the P2 monogram sits at the same coordinates and the existing crop still holds.

## Favicon and app icons

The full lockup is unusable at favicon size. The icon uses the **P2 monogram** alone — the
rounded `P` enclosing the orange `2` — on the brand navy.

Isolating it took some care. The monogram is not a separate path: the large `P` doubles as
the `P` of "PARTNER", and the three paths in the file (`wordmark`, `impact`, `accent`) each
span the whole lockup. So the mark is cut by `viewBox` plus a `clipPath`, with the boundary
measured rather than guessed — rendering the `wordmark` path alone and finding the first
column gap puts the split at x=485, where "ARTNER" begins. Measuring only the columns that
reach the top of the logo gives x=453 and slices the `P`'s shoulder off.

| File | Purpose |
| --- | --- |
| `favicon.ico` (repo root) | 16 / 32 / 48 in one file — the path browsers and Google request by default |
| `assets/img/favicon.svg` | Vector, the monogram on a rounded navy tile |
| `assets/img/icon-48.png`, `icon-96.png` | Google Search wants a raster square whose side is a multiple of 48px |
| `assets/img/icon-180.png` | `apple-touch-icon`, square-cornered because iOS applies its own rounding |
| `assets/img/icon-192.png`, `icon-512.png` | Android home screen, via `site.webmanifest` |

Padding inside the tile is 10%. More air looks better at 96px and turns to mush at 16px; the
mark's strokes are thin, so it needs the area.

## Design system

Every colour is taken from the 2026 logo rather than chosen alongside it.

| Token | Value | Use |
| --- | --- | --- |
| `--navy` / `--navy-900` / `--navy-700` | `#061e4f` / `#030f2b` / `#0d2f6b` | The logo's navy. Dark sections, headings, body text |
| `--teal` / `--teal-600` | `#096d91` / `#075670` | The logo's teal, used as-is. Links, buttons, eyebrows |
| `--teal-bright` | `#0e86b0` | Graphics, fills and borders only |
| `--teal-400` | `#5fb3ce` | On dark backgrounds |
| `--amber` / `--amber-600` | `#cf4703` / `#b63e03` | The logo's orange darkened. Primary CTA buttons |
| `--amber-bright` | `#fc6418` | The logo's orange. Graphics only |
| `--amber-400` | `#fa8a41` | On dark backgrounds |

**Two deliberate adjustments, both for contrast.**

The logo's teal `#096D91` needed none — it measures 5.82:1 with white text and is used
exactly as supplied. The orange `#FC6418` measures 3.01:1, well under the 4.5:1 threshold, so
button surfaces use a darkened `#cf4703` at 4.61:1 while graphics keep the true colour.

The dark-background pair was lifted a step (`#48A8C7` → `#5fb3ce`, `#FA7E2D` → `#fa8a41`).
The new navy is lighter than the slate it replaced, so accents that cleared AA against the
old background no longer did against card surfaces sitting on the new one.

Contrast was verified by sampling **rendered pixels**, not by reasoning about the cascade: the
page is screenshotted a second time with all text set to `transparent`, giving the true
backdrop behind every run of text including multi-layer gradients and translucent card fills.
Every text pairing on the site passes AA; the tightest is 4.53:1.

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
| `/bio-page` | `/about` |

Static hosting cannot issue a real 301, so each stub combines `<meta http-equiv="refresh">`
at zero delay — which Google reads as a permanent redirect — a JavaScript `location.replace`
that preserves any `#hash`, and a `canonical` pointing at the destination.

**No `noindex`.** The stubs carried one at first, which was wrong: `noindex` and `canonical`
are contradictory instructions, and Google resolves the conflict by honouring `noindex` and
dropping the page. That discards the old URL's accumulated ranking signals instead of passing
them to the new page, which is the whole point of the redirect. The canonical alone is the
consolidation signal, and the instant refresh backs it up.

The stub list came from Search Console's *Indexed pages* report rather than from guesswork —
`/bio-page` was indexed and returning 404 with nothing pointing at it.

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

## Booking, and the form that used to be here

`/contact` no longer asks questions. It embeds **Calendly's inline widget** and the visitor
picks a slot directly. Email sits under the calendar. **A Calendly badge floats in the corner
of every other page**; `/contact` is skipped, since a floating button over an inline calendar
is silly.

**`CALENDLY_URL` in `main.js` is the only place the booking address appears.** The widget div
on `/contact` ships with no `data-url` and no script tag of its own — `main.js` sets the
attribute before appending Calendly's script, which is what that script scans for. This is
worth the small indirection because the address is not stable: it has already moved from
Tracey's personal Calendly to the Generedge account that pays for Calendly and Zoom, and a
slug changes whenever an event is renamed. Two copies would have drifted on the first move.

Neither shape uses Calendly's copy-paste snippet. Their stylesheet is render-blocking and
their snippet puts it in `<head>`, so the badge loads on window load instead and can never
delay the page it sits on; and their snippet assigns `window.onload` directly, which would
clobber anything else that wanted it. The inline calendar is the contact page's main content,
so that one loads as soon as `main.js` runs.

**The fallback message has to be switched off when the iframe arrives.** Calendly *appends*
its iframe to the widget div rather than replacing what is inside it, so the first version
shipped a page that said "the booking calendar could not load" directly above a working
calendar. `.calendly-inline-widget:has(iframe) .scheduler-fallback { display: none }` fixes
it reactively — no timer to guess at, and if the iframe never arrives the message simply
stays.

**The fallback lives inside the widget div, not in `<noscript>`.** Calendly's script replaces
those children when it loads; if it never loads — a corporate firewall, a privacy extension,
an ad blocker, a bad network — the message stays on screen. In `<noscript>` it would only
cover JavaScript being switched off, and a blocked script would leave the visitor staring at
an empty 700px box. That is not hypothetical: it is exactly what happened the first time this
was rendered in CI, where the container cannot reach `assets.calendly.com`.

Three things follow from the switch, and none of them are code:

1. **The Google Sheet stops receiving leads.** Nothing posts to it any more. The script is
   still in `google-apps-script/Code.gs` and its deployment steps are still in its header
   comment, so the form is recoverable, but as of this change no submission reaches the sheet
   and no notification reaches `NOTIFY_EMAILS`.
2. **Calendly is the site's only third-party script, and the badge puts it on every page.**
   The site had no external scripts at all before this, and the badge widened the exposure
   from one page to all of them. `/privacy` says so plainly rather than burying it — the
   summary, the booking section and the cookies section were all rewritten when the badge
   went in, because each had said Calendly loaded only on `/contact`. Calendly's "Hide Cookie
   Banner" switch is left off, so their banner shows.
3. **Event length — resolved.** The site promises a "15-minute data health check up" and the
   Calendly event is 15 minutes. The current slug is `new-meeting`, Calendly's default for a
   freshly created event; it is invisible to visitors, but renaming the event in Calendly
   changes it, and `CALENDLY_URL` has to change with it.

The form markup, its 150 lines of CSS, and its 130-line handler in `main.js` are all removed
rather than left inert.

## Google Sheet via Apps Script (live)

`google-apps-script/Code.gs` is the backend. Paste it into the sheet's Apps Script editor and
deploy it as a web app — the file's header comment carries the click-by-click steps. It
appends one row per submission and emails everyone in `NOTIFY_EMAILS`, currently
`eduardo@generedge.com` and `tracey@generedge.com`.

The sheet and the script both live in the `eduardo@generedge.com` Google account.
`info@partner2impact.com` is still the address shown to visitors on the site, but it is
deliberately **not** on the notification list.

Moving the sheet between Google accounts mints a **new** `/exec` URL — the old one keeps
answering but writes to the old copy. `FORM_ENDPOINT` in `assets/js/main.js` has to be
updated to match, or submissions silently land in the wrong spreadsheet.

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

## Checking a design change

```bash
cd tools && npm install        # first time only
node tools/design-check.mjs    # or --shots to also save screenshots
```

Renders all seven pages in a real browser and measures three things: contrast
sampled from **actually painted pixels**, horizontal overflow at 360 / 390 / 768
/ 1440, and console errors. Exits non-zero on any failure, so it doubles as a
gate. `.claude/skills/design-check/` carries the full rationale and the
fix-in-this-order guidance.

Worth stating plainly, because it is the lesson this project kept re-learning:
**every visual bug that shipped here was invisible in the source and obvious in
a render.** Icons glued to headings, the footer logo on the wrong background, a
sliced favicon, an invalid `clamp()` silently dropping a declaration, a grid
floor forcing sideways scroll on a phone. None of them are catchable by reading
CSS. Run the check.

The site itself still has no dependencies; Playwright is dev-only and scoped to
`tools/`.

## Technical

- Responsive from 320px; verified for zero horizontal overflow at 360 / 390 / 768 / 1440
- Self-hosted webfonts — no third-party requests anywhere on the site
- Images in WebP with JPEG fallbacks; the 17 MB source headshot serves at 20–100 KB
- Accessibility: skip link, landmarks, visible focus rings, labelled fields with inline
  errors, `aria-current` nav, WCAG AA text contrast throughout
- The hero and the tool dashboard are built in CSS and inline SVG — no image requests, and
  the dashboard carries an `aria-label` describing it for screen readers
- Text contrast is verified against rendered pixels, sampled from a second screenshot taken
  with all text transparent, so gradients and translucent fills are measured as they paint
  (lowest pairing on the site is 4.53:1)
- `prefers-reduced-motion` disables all animation
- SEO: per-page titles and descriptions, canonicals, Open Graph, `ProfessionalService`
  structured data, `sitemap.xml`, `robots.txt`

## What the site must not claim

**No "IP targeting".** Tracey's instruction, verbatim: *"Do not use the term IP targeting on
the website."* The site describes what the capability achieves — digital canvassing,
targeted ad serving, hyper-targeted direct mail — never the mechanism. The nonprofit audience
has to be eased into this, and the mechanism is the part that spooks people.

**No named vendor, and no naming who resells it.** The platform behind the targeting is a
third party's, and Tracey's reason for keeping that off the site is commercial rather than
presentational: *"do not reference [the vendor] (giving away our back office)"*. The vendor
was named in the `/hyper-targeting` lead paragraph and twice in this README; all three are
gone. This repository is public, so the README is as exposed as the site.

**No "real time".** David confirmed the tool cannot do real-time updates, so advertising it
would be selling something that does not exist. Every instance was removed — the homepage
solution list, the `tool.html` capability section and its meta descriptions, the goldmine
paragraph and David's line in the about page. The homepage item that read *"Real-time donor
updates"* is now *"Hidden major donors"*.

Keep this in mind for any new copy: the tool re-reads records against fresh signals on a
cadence, it does not stream them live.

## Navigation

**Home · About Us · Solutions · Contact Us**, with Solutions opening a dropdown that holds
The Data Tool, Hyper-Targeting and Consulting, in that order.

**Resources is deliberately absent.** Tracey's nav sketch listed it, but there is no such
page and no content for one yet. A nav item pointing at a 404 is worse than a missing one, so
it goes in once there is something behind it.

The dropdown opens on hover for pointers, and the button carries `aria-expanded` so keyboard
and touch get the same menu without depending on hover — which does not exist on touch and
sticks after a tap. Escape closes it and returns focus to the button; so does clicking away
or tabbing past the last item. In the mobile drawer it expands inline instead of floating,
and the hover rules are switched off there for the same reason.

`.nav-sub-toggle[data-current]` marks the section the current page belongs to, so the trail
is visible without the menu being open.

## Hyper-targeting

Added at Tracey's request as the second half of the offer: predictive analytics says who,
hyper-targeted advertising reaches them. Her framing, from the briefing call: *"we're doing
the data mining, and then on top of that, the hyper-targeting."*

The capability blocks on `/hyper-targeting` are **Tracey's own copy, near-verbatim**; only
trailing full stops were added for consistency across the cards.

The set has been trimmed twice and now stands at three: **Digital Canvassing**,
**Hyper-targeted Direct Mail** and **Targeted Ad Serving Platform**. `CRM Enrichment` became
Direct Mail, and `Web-to-Home`, `Advanced Analytics` and `Donor Info and Insights` were all
dropped. The homepage teaser at `#reach` mirrors the same three.

The homepage carries a three-card teaser of the same content at `#reach`, placed after
Extract/Enrich/Execute — mine the data first, then go out and reach people. The hero lede
changed from "predictive data intelligence" to "predictive analytics and hyper-targeted
advertising", which was the specific edit she asked for.

## The legal pages

`/privacy` and `/terms`, linked from the footer of every page and listed in the sitemap.

They exist because the site now loads Calendly, which is its **first third-party script and
the only thing on the site that sets a cookie** — under an `/about` FAQ that claims GDPR and
CCPA compliance.

**The privacy policy is specific rather than boilerplate, and that was the point.** Before
writing it the site was audited for what it actually does, and the answer is unusually clean:
no analytics, no tag manager, no advertising or tracking pixels, no cookies of its own, no
`localStorage`, and self-hosted fonts, so loading a page does not tell a font network you
were here. The only external request on the whole site is Calendly's widget, and only on
`/contact`. A generic policy would have claimed cookie categories this site does not have and
would have been wrong in the organization's favour, which is the worst direction to be wrong
in. If analytics are ever added, that section stops being true and has to change with them.

The policy also covers the part that matters most to a nonprofit reading it: the donor data
handled under an engagement, where **the client is the controller and Partner2Impact is the
processor**, working on documented instructions under an agreement signed before access.

### These are drafts, not legal advice

They were written for this site by reading what it does, not by a lawyer. Three things are
deliberately absent rather than invented, and all three want a qualified review:

1. **No registered legal entity name.** The pages say "Partner2Impact", the trading name used
   everywhere else on the site.
2. **No postal address.** GDPR expects the controller's contact details; email alone is thin.
3. **No governing-law clause in the terms.** The jurisdiction was not known and guessing it
   from the client list would have been a guess in a clause that exists to remove ambiguity.

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
6. **Contact email** — `info@partner2impact.com` is what the site shows visitors. It
   replaced `Hello@Partner2Impact.com` on Tracey's instruction; confirm the mailbox exists
   and is monitored. Form notifications go to `NOTIFY_EMAILS` in `Code.gs` instead, not to
   this address.
7. **CRM list** on the homepage and in the form dropdown is a reasonable default set. Trim or
   extend it to the systems the tool actually integrates with.
8. **What the 15-minute call actually delivers.** `/contact` used to promise three things —
   a live tool demo, a data health read and quick wins. Tracey pulled all three until she
   has checked with David what is realistic to offer. The heading and the "fifteen minutes,
   no pitch deck" line stay; the list is gone and needs replacing once that is settled.
9. **The privacy FAQ names GDPR and CCPA.** The answer on `/about` is Tracey's own wording,
   reproduced almost verbatim — a statement about how the practice handles data, not a claim
   this repository can verify. It is the only place on the site that names a specific
   regulation, so it is the one to re-read if the data handling ever changes.
10. **"Data health check up"** is Tracey's wording, applied everywhere the offering is named.
   The standard English noun is "checkup" or "check-up"; "check up" as two words is the verb
   phrase. It appears in the `/contact` title tag and `h1`, so it is worth confirming with
   her before it settles into search results.
