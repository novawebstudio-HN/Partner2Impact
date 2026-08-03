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

| File | Purpose |
| --- | --- |
| `index.html` | Hero, the hard truth, solution grid, data-as-currency, partners, CTA |
| `tool.html` | The Data Tool — scoring, prospect discovery, how it fits your CRM |
| `consulting.html` | Consulting & Strategy — campaigns, alignment, pipeline growth |
| `about.html` | Tracey & David, why the partnership, track record, FAQ |
| `contact.html` | 15-minute data health check request form |
| `404.html` | Not-found page |

The previous `services.html` and `clients.html` are gone. The client list survives, trimmed
to nonprofit-sector organizations, as a track-record block inside `about.html`.

## Project structure

```
.
├── index.html  tool.html  consulting.html  about.html  contact.html  404.html
├── robots.txt  sitemap.xml
├── assets/
│   ├── css/
│   │   ├── fonts.css      # @font-face for the self-hosted webfonts
│   │   └── styles.css     # design system + all component styles
│   ├── fonts/             # Plus Jakarta Sans + Inter, woff2, latin & latin-ext
│   ├── img/               # optimised logo, headshots, favicon
│   └── js/
│       └── main.js        # nav, scroll reveal, form handling
└── Parnet2Impact Assets/  # original source files as supplied
```

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

`404.html` uses absolute asset paths (`/assets/…`) so it works from any URL depth; the five
main pages use relative paths so they survive a subdirectory deploy.

## Wiring up the form

The form works with no backend: on submit it opens the visitor's mail client with the
message pre-filled and addressed to `Hello@Partner2Impact.com`.

To deliver submissions to an inbox or CRM instead, set the endpoint in `assets/js/main.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxx';
```

Any service accepting a `FormData` POST works — Formspree, Basin, Netlify Forms, HubSpot, or
a custom handler. Client-side validation, the honeypot spam trap, and the success and error
states are already in place. The form posts `name`, `organization`, `email`, `phone`, `crm`,
`challenge` and `message`.

For live booking, a Calendly (or similar) link can replace the `contact.html#audit` targets
in the navigation and CTA bands.

## Technical

- Responsive from 320px; verified for zero horizontal overflow at 360 / 390 / 768 / 1440
- Self-hosted webfonts — no third-party requests anywhere on the site
- Images in WebP with JPEG fallbacks; the 17 MB source headshot serves at 20–100 KB
- Accessibility: skip link, landmarks, visible focus rings, labelled fields with inline
  errors, `aria-current` nav, WCAG AA text contrast throughout
- The hero dashboard is built in CSS and inline SVG — no image request, and it carries an
  `aria-label` describing it for screen readers
- `prefers-reduced-motion` disables all animation
- SEO: per-page titles and descriptions, canonicals, Open Graph, `ProfessionalService`
  structured data, `sitemap.xml`, `robots.txt`

## Open items before launch

These need Tracey's confirmation — they are claims or assets the site presents as fact:

1. **The hero dashboard is illustrative.** The figures ($2.4M portfolio, the donor names and
   scores) are invented placeholders to show the shape of the output. They are labelled as
   illustrative in the markup comment and no client data is implied, but if the real tool has
   a different interface, swap in a screenshot.
2. **"Secure major gifts / capital campaigns"** in Tracey's bio comes from the brief. Worth
   confirming the wording matches what she wants to claim publicly.
3. **David's title changed** from the old site's "public outreach strategist, Emmy
   Award–winning writer and producer" to "senior data scientist," per Tracey's own
   description of him in the brief. His earlier credentials are no longer mentioned anywhere
   — confirm that is intended.
4. **The tool has no product name** on the site. If it gets one, it should replace the
   generic "the tool" references.
5. **The logo is the existing one.** The brief calls for a redesigned mark in the new
   palette; the current navy-and-maroon logo is a placeholder until that exists.
6. **Contact email** — `Hello@Partner2Impact.com`, carried from the old site. Confirm it is
   still monitored.
7. **CRM list** on the homepage and in the form dropdown is a reasonable default set. Trim or
   extend it to the systems the tool actually integrates with.
