# 02 — Design System: Motto®

> Architectural Blueprint on White Canvas. Black lines and precise typography
> articulate structure and ideas against an expansive, bright background.

**Theme:** light (no dark mode)

Source: https://styles.refero.design/style/6eb5fc89-d0db-4293-8bff-13c5aa530a28
Kindred brands: Linear, early Stripe, Anthropic.

The Motto® design system evokes rigorous clarity and understated authority.
Stark contrast between crisp black text and a near-white canvas. Bold display
typography dictates the visual rhythm. No ornamentation, shadows, or vibrant
color. The user's eye goes to content and message, nothing else.

---

## Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Pitch Black | `#000000` | `--color-pitch-black` | Primary text, icons, borders, link/nav/button-outline states. Grounds the design in high contrast. |
| Canvas White | `#ffffff` | `--color-canvas-white` | Page backgrounds, card surfaces, ghost-button text, filled-button text. The vast airy negative space. |
| Charcoal Surface | `#1b1b1c` | `--color-charcoal-surface` | Solid fills for primary CTA buttons. Deep counterpoint to white, no color. |
| Cloud Gray | `#f2f2f2` | `--color-cloud-gray` | Subtle background for hero / alternating blocks. Slight break from pure white. |
| Stone Accent | `#d8d8d8` | `--color-stone-accent` | Divider lines, subtle borders, background accents. Minimal separation. |
| Ash Text | `#4d5153` | `--color-ash-text` | Secondary body text, subtle link colors. |
| Silver Text | `#848484` | `--color-silver-text` | Lighter body text for lists / de-emphasized links. |
| Input Border | `#c8cacd` | `--color-input-border` | Input field borders — fine, light line. |
| Faint Gray | `#717476` | `--color-faint-gray` | Tertiary text, footnotes, low-emphasis content. |
| Vivid Purple | `#9c98ef` | `--color-vivid-purple` | **Decorative only.** Rare background graphic accents. Not UI. |
| Electric Violet | `#6980ff` | `--color-electric-violet` | **Decorative only.** Rare background graphic accents. Not UI. |
| Grass Green | `#beee98` | `--color-grass-green` | **Decorative only.** Rare background graphic accents. Not UI. |

Chromatic colors (purple/violet/green) are **strictly decorative** — never on
text, buttons, links, or functional UI.

---

## Typography

Two families. Both weight **500** only. Never mix in undefined weights.

### `disp` — display / headlines
- Substitute stack: `Oswald, Impact, sans-serif`
- Weight: 500
- Sizes: 61px, 99px, 138px, 139px, 154px
- Line height: 1.00, 1.10
- Use **exclusively** for large, commanding headlines (61–154px).

### `sans` — everything else
- Substitute stack: `Inter, Arial, Helvetica, sans-serif`
- Weight: 500
- Sizes: 14px, 15px, 17px, 18px, 20px, 25px, 34px, 48px
- Line height: 1.14, 1.26, 1.30, 1.38, 1.40, 1.60
- UI, body, subheadings, captions, nav, links.

### Type scale

| Role | Size | Line height | Token |
|------|------|-------------|-------|
| caption | 14px | 1.4 | `--text-caption` |
| body | 17px | 1.38 | `--text-body` |
| subheading | 25px | 1.14 | `--text-subheading` |
| heading-sm | 34px | 1.14 | `--text-heading-sm` |
| heading | 48px | 1.14 | `--text-heading` |
| heading-lg | 61px | 1.10 | `--text-heading-lg` |
| display-sm | 99px | 1.00 | `--text-display-sm` |
| display | 154px | 1.00 | `--text-display` |

Type scale: Major Third (1.25) from 15px base.

---

## Spacing & Shape

**Density:** spacious.

### Spacing scale (px)
8, 15, 19, 21, 23, 24, 29, 38, 48, 58, 67, 70, 77, 96, 158
Tokens: `--spacing-8` … `--spacing-158`.

### Border radius
- Cards / content blocks / layout: **0px** (sharp, always).
- Buttons / tags / pill atoms: **9999px**.

### Layout
- Section gap: **48px**.
- Card padding: 0px intrinsic (content padding applied internally).
- Max-width contained, centered on Canvas White.

---

## Components

**Navigation Link** — text only, Pitch Black, no bg/border, 0px padding,
`sans` weight 500.

**Ghost Button (text)** — transparent bg, Pitch Black text + border, 0 radius,
`sans`.

**Ghost Button (white text)** — same on dark bg, Canvas White text + border.

**Filled Button (pill, primary CTA)** — Charcoal `#1b1b1c` bg, Canvas White
text, 9999px radius, 0px vertical / ~28.8px horizontal padding, `sans` 500.

**Ghost Button (pill, icon-only)** — transparent, white icon + border, 9999px,
~15.36px all-side padding.

**Info Card** — transparent bg, 0 radius, **no shadow**, content padding
internal. For testimonials / feature blocks.

**Text Input (underlined)** — transparent bg, Input Border `#c8cacd` bottom
border only, 0 radius, generous padding.

---

## Do

- High contrast: Pitch Black text on Canvas White or Cloud Gray.
- `disp` (500) exclusively for big headlines (61–154px) — clear hierarchy.
- Generous whitespace; 48px section gaps; element gaps 8–70px.
- 9999px radius **only** on interactive pill atoms (buttons, tags).
- 0px radius on every non-interactive container.
- Charcoal `#1b1b1c` for primary button fills.

## Don't

- No drop shadows, no heavy gradients. Elevation = hierarchy + space, not depth.
- No chromatic color on UI/text beyond the neutral palette.
- No deviating from `sans` 500 for body/links/nav; no undefined weights.
- No rounded corners on cards, sections, or layout blocks. Sharp only.
- No low-contrast gray-on-gray text below AAA.
- No decorative imagery competing with type. Abstract/monochrome/product only.

---

## Imagery

Largely absent in main UI. No photography. Stark, text-dominant. Occasional
abstract monochrome graphic elements (asterisk, arrow) that are functional, not
decorative. Typography carries the visual weight.

## Layout philosophy

Max-width contained, centered, Canvas White. Hero full-width with a dramatic
oversized `disp` headline, vertically centered. Consistent vertical rhythm
(48px section gap). Single-column stacks or simple two-column text layouts. No
card grids — content blocks are isolated entities emphasizing individual
messages. Persistent minimal top nav.

---

## Quick start — CSS custom properties

```css
:root {
  /* Colors */
  --color-pitch-black: #000000;
  --color-canvas-white: #ffffff;
  --color-charcoal-surface: #1b1b1c;
  --color-cloud-gray: #f2f2f2;
  --color-stone-accent: #d8d8d8;
  --color-ash-text: #4d5153;
  --color-silver-text: #848484;
  --color-input-border: #c8cacd;
  --color-faint-gray: #717476;
  --color-vivid-purple: #9c98ef;
  --color-electric-violet: #6980ff;
  --color-grass-green: #beee98;

  /* Fonts */
  --font-sans: 'Inter', Arial, Helvetica, sans-serif;
  --font-disp: 'Oswald', Impact, sans-serif;
  --font-weight-medium: 500;

  /* Type scale */
  --text-caption: 14px;     --leading-caption: 1.4;
  --text-body: 17px;        --leading-body: 1.38;
  --text-subheading: 25px;  --leading-subheading: 1.14;
  --text-heading-sm: 34px;  --leading-heading-sm: 1.14;
  --text-heading: 48px;     --leading-heading: 1.14;
  --text-heading-lg: 61px;  --leading-heading-lg: 1.1;
  --text-display-sm: 99px;  --leading-display-sm: 1;
  --text-display: 154px;    --leading-display: 1;

  /* Spacing */
  --spacing-8: 8px;     --spacing-15: 15px;   --spacing-19: 19px;
  --spacing-21: 21px;   --spacing-23: 23px;   --spacing-24: 24px;
  --spacing-29: 29px;   --spacing-38: 38px;   --spacing-48: 48px;
  --spacing-58: 58px;   --spacing-67: 67px;   --spacing-70: 70px;
  --spacing-77: 77px;   --spacing-96: 96px;   --spacing-158: 158px;

  /* Layout & radius */
  --section-gap: 48px;
  --card-padding: 0px;
  --radius-cards: 0px;
  --radius-buttons: 9999px;
}
```

> Display sizes (138–154px) are for very wide viewports. Clamp down responsively
> on smaller screens — see `03-directions.md`.
