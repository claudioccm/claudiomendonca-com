# 03 — Build Directions

How to execute. Read `01-brief.md` and `02-design-system-motto.md` first.

## Tech stack

- **Nuxt 4** (latest). Two routes: `/` (one-pager) and `/services`.
  Shared layout (nav + footer) wraps both.
- Project root: `~/Documents/GitHub/personal/claudiomendonca.com/`.
- Fonts via Google Fonts: **Oswald** (`disp`) and **Inter** (`sans`), weight
  500 only. Use `@nuxt/fonts` or a `<link>` in `nuxt.config` app head.
- Motto® tokens in `assets/css/tokens.css`, imported globally. Reset/base in a
  small global stylesheet. Component-scoped styles otherwise.
- No UI kit. No Tailwind unless it speeds token wiring — if used, drive it from
  the CSS variables, do not hardcode hex.
- Static. No backend, no data fetching.

## Page structure (top → bottom)

### 1. Nav (sticky)
- Left: `Claudio Mendonça` wordmark, `sans` 500, Pitch Black.
- Right: links — `Work`, `Services` (→ `/services`), `About`, `Contact`.
  `sans` 500, Pitch Black, no bg/border. `Work`/`About`/`Contact` are home
  anchors; on `/services` they should link back to `/#work` etc.
- Canvas White background, no shadow. Optional 1px Stone Accent bottom border
  on scroll. Persistent / always available.

### 2. Hero
- Full-width, Canvas White (or Cloud Gray block).
- Oversized `disp` headline, weight 500. Working line:
  **"AI products & explorations."** (Claudio to confirm/replace.)
- One `sans` body (17px, 1.38) subline stating who he is / what he builds.
- A single monochrome down-arrow glyph below subline (functional, Pitch Black).
- Generous vertical space; headline vertically prominent.

### 3. Work
- Section heading in `disp` or `heading` scale: e.g. **"Work"**.
- Render from a **product data array** (see brief). Each product = an isolated
  content block (Info Card rules: 0 radius, no shadow, transparent bg):
  - Product name — `disp` (clamp size) or `heading`.
  - One-line positioning — `sans` 500, Pitch Black.
  - Short blurb — `sans` body, Ash Text acceptable for secondary.
  - Link out — **Filled pill button** (`#1b1b1c` bg, white text, 9999px) or
    ghost text button. Opens product site (`target="_blank"`, `rel="noopener"`).
- Blocks stacked single-column (or simple two-column on wide), large gaps
  between (≥48px). **No card grid, no boxes-with-borders.** Isolated entities.

### 4. About
- Short bio paragraph. `sans` body. Secondary detail in Ash/Faint Gray.
- Keep it tight — a few sentences, not a résumé.

### 5. Footer
- Nav/anchor links repeated. `© 2026 Claudio Mendonça`.
- Ash Text `#4d5153`, `sans` caption (14px). Ample padding, spacious.
- Contact = `mailto:` link (claudioccm@gmail.com unless told otherwise).

## Product data shape

```ts
interface Product {
  key: string          // 'cutthecrap'
  name: string         // 'Cut The Crap'
  tagline: string      // one line, confident, no fluff
  blurb: string        // 2–3 sentences max
  url: string          // external link; mark TODO if unknown
}
```

Launch set: `cutthecrap`, `edge`, `squoosh.ccmdesign`, `varro`. Adding a
product later must be a one-line array edit, never a layout change.

## Copy guidance

- Draft positioning + blurbs from name/context. **Flag every uncertain fact**
  with an inline `TODO(claudio):` so it's obvious at first preview.
- No invented metrics, dates, funding, user counts, or named clients.
- Voice: terse, confident, content-forward. No marketing adjectives. Matches
  Motto®'s "cut the fluff" tone. Reference Claudio's voice/tone guide if
  available before finalizing.

## Responsive

- Mobile-first. Display type (138–154px) is desktop-only — `clamp()` it down
  (e.g. hero `clamp(48px, 12vw, 139px)`); keep line-height 1.0–1.1.
- Maintain whitespace ratios on mobile; reduce absolute gaps proportionally.
- Single column on small screens. Tap targets ≥44px (pill buttons satisfy this).
- Test at 375 / 768 / 1280 / 1440.

## Accessibility

- AAA contrast on text (palette already satisfies; do not lower-contrast gray
  text on light bg below spec).
- Real semantic landmarks: `header`, `nav`, `main`, `section`, `footer`.
- Anchor nav scrolls smoothly; honor `prefers-reduced-motion`.
- All external links: discernible text, `rel="noopener"`.

## Verification before "done"

1. `npm run dev` runs clean (no console errors).
2. Visual check full scroll at 1440 and 375 — matches Motto® (B&W, sharp
   cards, pill buttons, no shadows, big type, spacious).
3. Every product links out correctly; `TODO(claudio):` markers visible for
   anything unconfirmed.
4. Lighthouse / basic a11y pass on contrast + landmarks.
5. Screenshot the result and hand back for Claudio's copy edits.

## Explicit constraints

- Do **not** add dark mode, CMS, analytics, forms, or per-product pages in v1.
- Do **not** introduce chromatic color into UI/text.
- Do **not** round content containers or add shadows/gradients.
- Keep dependencies minimal — Nuxt + fonts. No component libraries.
