---
name: design-check
description: Render the site in a real browser and measure it — contrast against actual painted pixels, horizontal overflow at four widths, console errors. Use after any change to styles.css, to a page's markup, to the palette, or to the logo; before opening a PR that touches design; and whenever a change "looks fine" but has not been rendered.
---

# Design check

Run this instead of reasoning about whether a visual change is correct.

```bash
cd tools && npm install          # first time only
node tools/design-check.mjs                 # audit
node tools/design-check.mjs --shots         # audit + screenshots in tools/shots/
```

Exits non-zero when anything fails, so it also works as a gate.

If the environment ships its own browser, point at it and skip Playwright's
download:

```bash
CHROME_PATH=/path/to/chrome node tools/design-check.mjs
```

## What it checks, and why these three

Every bug this project shipped and then had to fix was invisible in the source
and obvious in a render. That is the whole rationale.

| Found by rendering | What the code looked like |
| --- | --- |
| Icons glued to their headings on `/tool` | A CSS rule that only *looked* scoped to the cards that had been updated |
| Footer logo using the light variant on navy | A string replacement whose pattern was a prefix of another |
| The `P`'s shoulder sliced off the favicon | A boundary measured from the wrong feature |
| Score pills below AA on `/tool` | A translucent accent fill lifting the panel beneath it |
| `margin-bottom` computing to `0px` | `clamp(2rem,1.5rem+2vw,3rem)` — invalid without spaces, so the whole declaration was dropped |
| Footer scrolling sideways at 360px | A `minmax()` floor that forced the grid wider than the phone |

**1. Contrast, sampled from rendered pixels.** The page is screenshotted a
second time with every text run set to `transparent`, which yields the true
backdrop behind each one. Each text box is sampled at nine points and scored at
its worst.

Do not replace this with a calculation over the cascade. Two earlier attempts
did and both produced confident nonsense — one assumed every `background-image`
gradient was dark and failed every element on the light card gradient; the next
parsed gradient stops and combined them into backdrops that never paint, like
white behind the hero. Gradients, translucent fills and stacked overlays
compose in ways that are painful to predict and trivial to photograph.

**2. Horizontal overflow at 360 / 390 / 768 / 1440.** One element a few pixels
too wide makes the entire page scroll sideways on a phone. The report names the
offending elements, not just the page.

**3. Console and page errors.**

## Reading the output

`all clean` means all three passed, and it prints the tightest *passing*
contrast pair so you can see how much headroom is left. Anything under about
4.7:1 is close enough that the next palette change will break it.

A failure prints the measured ratio, the threshold that applied (4.5:1 normal,
3:1 for large text) and the text itself.

## Fixing contrast failures

Reach for these in order:

1. **Darken the surface under the text**, rather than lightening the text. A
   translucent *accent* fill lifts whatever is beneath it — that is what put the
   score pills under AA. A dark tint keeps the component's shape while the hue
   lives in the border and the label.
2. **Raise the alpha** on deliberately-muted text. Values around `0.5`–`0.6`
   that passed against one background often miss against a lighter one.
3. **Lift the token**, last. `--teal-400` and `--amber-400` already sit a step
   above the logo's own dark-background pair for exactly this reason; moving
   them further drifts from the brand.

Measure against the *worst* point of a gradient, not its average.

## Caveats

- `.skip-link` is excluded. It is positioned off-screen until focused, so
  sampling it reads the page behind it and reports a failure that is not real.
- `[data-reveal]` elements are forced visible before measuring; otherwise the
  audit photographs a mostly blank page.
- The local server resolves `/tool` to `tool.html`, matching how GitHub Pages
  serves the site. Without that every clean URL would 404 and the audit would
  measure error pages.
- Contrast is measured at 1440px only. Text colours do not change with width
  here; overflow is what varies, and that is checked at all four.
