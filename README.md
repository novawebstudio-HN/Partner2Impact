# Partner2Impact — website redesign

A rebuilt version of [partner2impact.com](https://partner2impact.com), replacing the 2020
GoDaddy-builder site with a hand-built, responsive, accessible static site.

Everything is plain HTML, CSS and vanilla JavaScript — no build step, no framework, no
dependencies. Drop the folder on any static host and it works.

---

## Pages

| File | Replaces | Purpose |
| --- | --- | --- |
| `index.html` | `/home` | Hero, capabilities, positioning, services overview, process, team, clients, CTA |
| `about.html` | `/about-1` | Firm story, engagement principles, team bios, FAQ |
| `services.html` | `/services` | The three practice areas in detail + engagement models |
| `clients.html` | `/client-list` | Sectors served and the partial client list |
| `contact.html` | `/contact-us` | Contact details and a validated enquiry form |
| `404.html` | — | Not-found page |

## Project structure

```
.
├── index.html  about.html  services.html  clients.html  contact.html  404.html
├── robots.txt  sitemap.xml
├── assets/
│   ├── css/
│   │   ├── fonts.css      # @font-face declarations for the self-hosted webfonts
│   │   └── styles.css     # design system + all component styles
│   ├── fonts/             # Fraunces + Inter, woff2, latin & latin-ext subsets
│   ├── img/               # optimised logo, headshots, favicon
│   └── js/
│       └── main.js        # nav, scroll reveal, form handling
└── Parnet2Impact Assets/  # original source files as supplied
```

## Running it locally

No build required. Serve the folder over HTTP (opening the files directly with `file://`
works, except the self-hosted fonts, which browsers block over that protocol):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, Vercel, or the existing
hosting via FTP. There is nothing to compile.

If you deploy somewhere other than the site root, note that `404.html` uses absolute paths
(`/assets/…`) while the five main pages use relative ones, so they survive a subdirectory
deploy on their own.

## Wiring up the contact form

The form works out of the box with no backend: on submit it opens the visitor's mail client
with the message pre-filled and addressed to `Hello@Partner2Impact.com`.

To have submissions delivered straight to an inbox instead, set the endpoint near the top of
the contact-form section in `assets/js/main.js`:

```js
var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxx';
```

Any service accepting a `FormData` POST (Formspree, Basin, Netlify Forms, Web3Forms, a custom
handler) will work — the client-side validation, the honeypot spam trap and the success and
error states are already in place.

To change the address the form and the site link to, update `CONTACT_EMAIL` in
`assets/js/main.js` and the `mailto:` links in the page footers.

## What changed from the original

**Content** — all original copy is preserved (headlines, service lists, team bios, the client
list, the "If not now, when?" call to action). Added copy expands on what was already there;
no claims, statistics or testimonials were invented.

**Structure** — the client list moved from a single paragraph to a scannable grid, services
gained per-item descriptions, and every page ends with the same booking call to action.

**Design** — a real type system (Fraunces for display, Inter for text), a palette sampled from
the logo itself (navy `#102f54`, maroon `#7a2246`), consistent spacing, cards, and section
rhythm.

**Technical**
- Responsive from 320px up; no horizontal overflow at any width
- Self-hosted webfonts — no third-party requests anywhere on the site
- Images converted to WebP with JPEG fallbacks available; the 17 MB source headshot is now
  20–100 KB depending on the size served
- Accessibility: skip link, landmarks, visible focus rings, labelled form fields with inline
  error messages, `aria-current` on the active nav item, and text contrast that meets WCAG AA
- `prefers-reduced-motion` disables all animation
- SEO: per-page titles and meta descriptions, canonical URLs, Open Graph tags,
  `ProfessionalService` structured data, `sitemap.xml` and `robots.txt`
- Print stylesheet

## Assets

Source files supplied in `Parnet2Impact Assets/` (logo, Tracey's headshot, David's headshot)
are kept as-is. The optimised derivatives used by the site live in `assets/img/` and can be
regenerated at any time from the originals.
