---
id: PRO-77
title: "feat: Home page — hero, experiments grid, about"
type: feat
status: active
created: 2026-05-21
plan_depth: standard
worktree: experiments/claudiomendonca.com-wt/PRO-77
branch: feature/PRO-77-home-page
depends_on: PRO-76
origin_docs:
  - 01-brief.md
  - 02-design-system-motto.md
  - 03-directions.md
  - _process/prototype/index.html
  - _process/prototype/styles.css
---

# feat: Home page — hero, experiments grid, about

## Summary

Replace the placeholder `app/pages/index.vue` with the real home one-pager built from `_process/prototype/index.html`: a Hero (eyebrow row, clamp-disp H1 "AI EXPERIMENTS", sub paragraph, dual CTA, down-arrow), a 2×2 Experiments grid that collapses to one column under 760px, and a two-column About block (1fr 1.4fr, label + h2 + bio). Hero and Experiment Card are extracted as reusable components — `HeroSection.vue` is slot-driven so PRO-78 can reuse it for `/consulting`; `ExperimentCard.vue` is a leaf component fed entirely from props. Card data lives in a typed `app/data/experiments.ts` array seeded with cutthecrap, edge, squoosh, and varro so adding a fifth product is a single array entry with no layout change.

Chrome (nav + footer + tokens + base) is already in place from PRO-75/PRO-76 and is not touched. Page-section CSS lifted out of the prototype lands in a new `app/assets/css/sections.css` registered after `chrome.css`, mirroring the precedent K1 set in PRO-76.

---

## Problem Frame

PRO-75 ported tokens + base styles. PRO-76 stood up the shared chrome (nav, footer, default layout) and left `app/pages/index.vue` as a one-section placeholder. The prototype's real home markup and styling live at:

- `_process/prototype/index.html` lines 34–53 (Hero), 56–129 (Experiments grid), 132–157 (About).
- `_process/prototype/styles.css` lines 275–326 (`.hero*`, `.down-arrow`), 328–357 (`.section-head*`), 366–414 (`.experiments-grid`, `.experiment .shot`, stripes), 416–471 (`.experiment-caption*`, legacy-element resets), 541–565 (`.bio-grid*`, `.bio-body*`), 171–225 (button atoms `.btn`, `.btn-filled`, `.btn-ghost`, `.btn-arrow`, `.btn-text` — deferred from PRO-76, owed here).

PRO-77 needs to:

1. Lift the hero, experiments grid, and about markup out of the prototype and into Nuxt 4 Vue components / pages, preserving the prototype's class names verbatim so the lifted CSS works without renames.
2. Land the button atoms (`.btn`, `.btn-filled`, `.btn-ghost`, `.btn-arrow`) that PRO-76 explicitly deferred — the hero CTA row is their first consumer.
3. Replace the prototype's `<image-slot>` web component (defined in `_process/prototype/image-slot.js`, drop-zone editor tool) with a static `NuxtImg` + CSS stripes fallback, since the editor tool has no business in production.
4. Extract a reusable `HeroSection.vue` whose API is slot-driven so PRO-78 (consulting page) can reuse it with a different eyebrow caption, headline, sub, and CTA pair, without forking the component.
5. Extract `ExperimentCard.vue` as a leaf component whose API is fully prop-driven, so the page never inlines per-card markup and so the data file is the only thing that grows when products are added.
6. Centralize the card data in `app/data/experiments.ts` behind a TypeScript interface, with TODO markers next to anything the prototype doesn't supply confidently (real URLs for cutthecrap / edge / varro; real product screenshots for all four).
7. Copy the prototype mockup PNGs to `public/screenshots/` as placeholders so the cards render images on day one; the real per-product screenshots are explicitly out of scope.
8. Add `id="work"` and `id="about"` anchor targets that the route-aware nav from PRO-76 already points to (R6 of PRO-76: Experiments → `#work`, About → `#about`).

---

## Requirements

Traced from the PRO-77 Plane ticket and `_process/prototype/index.html`:

- **R1.** `app/pages/index.vue` renders, in this order: a `<HeroSection>`, a `<section id="work">` containing a 2×2 experiments grid populated by iterating `app/data/experiments.ts` and rendering one `<ExperimentCard>` per entry, and a `<section id="about">` containing the bio block.
- **R2.** `HeroSection.vue` is reusable. It exposes named slots — `eyebrow`, `headline`, `sub`, `ctas` — plus a controlled `downArrow` prop (default `true`) and a `downArrowHref` prop (default `"#work"`). When `downArrow` is false the down arrow is not rendered. All slots are optional; an empty slot omits its row entirely. (See K2.)
- **R3.** On `/`, `HeroSection` is used with: `eyebrow` slot = dot + "CLAUDIO MENDONÇA — FOUNDER.DESIGNER.ENGINEER"; `headline` slot = an `<h1>` containing `AI EXPERIMENTS`; `sub` slot = "I build opinionated AI experimental tools. Use with moderation. This page is the index."; `ctas` slot = `.btn-filled` "See the work →" linking to `#work`, plus `.btn-ghost` "Consulting" linking to `/consulting`. The down-arrow is shown and points at `#work`.
- **R4.** The hero H1 inherits the prototype's clamp sizing — `clamp(72px, 16.5vw, 200px)`, line-height `0.92`, letter-spacing `-0.02em`, uppercase, Oswald 500. No new tokens are introduced; the clamp value matches `_process/prototype/styles.css` line 298. The literal inline `style="font-size: 150px"` from `index.html` line 41 is dropped.
- **R5.** `ExperimentCard.vue` accepts props: `idx` (number), `title` (string), `tag` (string), `href` (string), `image` (string — path under `/screenshots/`, optional), `alt` (string). The component renders a single `<a class="experiment">` anchor wrapping a `.shot` frame and an `.experiment-caption` row (idx · title-block (title + tag) · `↗`). All hover behavior is CSS-only.
- **R6.** Shot frame behavior. When `image` is a non-empty string the card renders a `<NuxtImg>` filling the 4:3 frame. Whether or not an image is supplied, the `.stripes` element renders behind the image (`position:absolute; inset:0`) so a missing or broken image falls through to the stripes pattern visually. The `.idx` is rendered with a leading zero (`01`, `02`, …) via the component, so the data file stores plain numbers. (See K3.)
- **R7.** Hover behavior matches the prototype: `.experiment:hover .shot image-slot::part(image)` becomes `.experiment:hover .shot img { transform: scale(1.02); }` after swapping the web component for `NuxtImg`; the `.arrow` translate stays as `translate(4px, -4px)` on `.experiment:hover`. Both transitions are `cubic-bezier(.2,.7,.2,1)`. No JavaScript runs for hover.
- **R8.** The experiments grid uses `.experiments-grid` exactly as lifted from `_process/prototype/styles.css` lines 366–375: `grid-template-columns: repeat(2, 1fr)` with `gap: clamp(48px, 6vw, 96px) clamp(32px, 4vw, 48px)`, padding-top + 1px top border, and a `@media (max-width: 760px)` rule collapsing to one column.
- **R9.** `app/data/experiments.ts` exports a typed array. The TypeScript interface is `interface Experiment { id: string; title: string; tag: string; url: string; image: string; alt: string; }`. The default export (or named `experiments` export — see K4) is `Experiment[]`. The file is pre-seeded with the four products in this order: `cutthecrap`, `edge`, `squoosh`, `varro`, copied from the prototype with `TODO(claudio)` markers on any field that is not confidently knowable from the source.
- **R10.** Pre-seeded entries:
  - `cutthecrap` — title "Cut The Crap", tag "YOUTUBE VIDEOS AS TWEETS", url `TODO(claudio)` (prototype uses `#`), image `/screenshots/cutthecrap.jpg`, alt "Cut The Crap — YouTube videos as tweets".
  - `edge` — title "Edge", tag "AUTO GENERATED BLOG ABOUT AI NEWS & RESEARCH", url `TODO(claudio)`, image `/screenshots/edge.jpg`, alt "Edge — auto-generated AI news blog".
  - `squoosh` — title "BATCH SQUOOSH", tag "Tool · Self-hosted", url `https://squoosh.ccmdesign.com`, image `/screenshots/squoosh.jpg`, alt "Batch Squoosh — self-hosted image compression".
  - `varro` — title "Varro", tag "FULLY AI GENERATED BLOG & SOCIAL MEDIA CONTENT", url `TODO(claudio)`, image `/screenshots/varro.jpg`, alt "Varro — fully AI generated blog and social content".
  Title casing matches the prototype literally (`BATCH SQUOOSH` is uppercased in the prototype line 105 — preserve that; the `.experiment-caption h3` already applies `text-transform: uppercase`, but matching source casing keeps screen-reader pronunciation aligned).
- **R11.** Placeholder image mapping into `public/screenshots/`. The six prototype mockups under `_process/prototype/screenshots/` include duplicates (home-hero ≡ home-work, home-grid-captions ≡ home-grid-v2). Map them to product slots like this:
  - `cutthecrap.jpg` ← copy of `home-grid.png`
  - `edge.jpg` ← copy of `home-grid-bottom.png`
  - `squoosh.jpg` ← copy of `home-grid-captions.png`
  - `varro.jpg` ← copy of `home-grid-v2.png`
  Files are renamed to `<id>.jpg` (the source files are JPEG bytes despite the `.png` extension — confirmed by `file(1)`) so the data file's `image` paths match. `TODO(claudio)`: replace with real product screenshots in a follow-up; the per-product slot mapping is placeholder-only and not a design decision.
- **R12.** About block. `<section id="about">` contains a `.bio-grid` (1fr 1.4fr) with a left column (label dash + "About" caption + uppercase `<h2>About.</h2>`) and a right column (`.bio-body`) containing the three bio paragraphs from `_process/prototype/index.html` lines 142–153 verbatim. The "consulting page" link in the second paragraph is a `<NuxtLink class="link-underline" to="/consulting">` rather than an `<a href="consulting.html">`.
- **R13.** Page section styles live in a new `app/assets/css/sections.css` registered in `nuxt.config.ts`'s `css` array immediately after `chrome.css`. Component styles are not used. (See K1.)
- **R14.** Hover, scale, and translate transitions must be disabled or instantaneous under `@media (prefers-reduced-motion: reduce)`. The rule is added once in `sections.css` and zeroes out the `transition` and the `transform` on `.experiment:hover .shot img` and `.experiment:hover .experiment-caption .arrow`. (Honors `base.css` lines 60–62.)
- **R15.** SSR safety. No `window`, `document`, `localStorage`, or browser-only API is referenced from the home page or either new component during setup or first render. The page has no client-only state.
- **R16.** Acceptance from the ticket: the home page renders all four cards from the array (DOM contains exactly four `.experiment` anchors). Adding a fifth product is one new entry in `app/data/experiments.ts` and a new file in `public/screenshots/` — no edit to `index.vue`, `ExperimentCard.vue`, `HeroSection.vue`, or `sections.css`.

---

## Scope Boundaries

### In scope

- New files: `app/components/HeroSection.vue`, `app/components/ExperimentCard.vue`, `app/data/experiments.ts`, `app/assets/css/sections.css`, `public/screenshots/{cutthecrap,edge,squoosh,varro}.jpg`.
- Replaced files: `app/pages/index.vue` (placeholder → real home one-pager).
- Modified files: `nuxt.config.ts` (add `sections.css` to the `css` array after `chrome.css`).
- Button atoms (`.btn`, `.btn-filled`, `.btn-ghost`, `.btn-arrow`) lifted into `sections.css` from `_process/prototype/styles.css` lines 171–213. (`.btn-text` is deferred — no consumer in PRO-77.)
- Behaviors listed in R1–R16 above.

### Out of scope (deferred to follow-up tickets)

- **Real product screenshots** for cutthecrap, edge, squoosh, varro. Placeholders ship in this ticket; real screenshots replace them when Claudio supplies them.
- **Real URLs** for cutthecrap, edge, varro. Stay as `TODO(claudio)` strings (`#` fallback in markup) until Claudio supplies them.
- **`/consulting` page content** — PRO-78. PRO-77 only ensures the `HeroSection` API is reusable enough that PRO-78 doesn't need to fork it.
- **Bio copy rewrite.** The three paragraphs are lifted verbatim from the prototype. Tightening the prose, adding social-proof items, or restructuring the about block is out of scope.
- **Animations beyond hover.** No scroll-driven reveals, no parallax, no entrance animations, no lottie. The prototype has none and this ticket adds none.
- **`<image-slot>` web component port.** The prototype's editor tool stays in `_process/`; production uses `NuxtImg` + stripes.
- **`.btn-text` button variant.** Lifted styles for `.btn-text` (prototype lines 215–225) wait until a consumer exists (likely PRO-78).
- **`.entry*` / `.entry-list` styles** (prototype lines 360–364, 474–539, 669–676). Those belong to the services list on the consulting page — PRO-78.
- **CTA banner, steps, outcomes** (prototype lines 582–667). Consulting page only — PRO-78.
- **Per-page `<title>` / meta differentiation** via `definePageMeta` / `useHead`. The global `app.head` from PRO-75 covers home adequately.

---

## Key Technical Decisions

### K1. Page-section styles live in `app/assets/css/sections.css`, not scoped to components

**Decision.** Lift `.hero*`, `.down-arrow`, `.section-head*`, `.experiments-grid`, `.experiment*`, `.bio-grid*`, `.bio-body*`, and the button atoms (`.btn`, `.btn-filled`, `.btn-ghost`, `.btn-arrow`) into a new global stylesheet `app/assets/css/sections.css`. Register it in `nuxt.config.ts` `css` array immediately after `chrome.css`.

**Why.**
- PRO-76 set the precedent in K1 of its plan: chrome selectors stay global because they're part of the system, not encapsulated widgets, and other parts of the codebase need to reference them. The same logic applies here. `.btn` is consumed by the hero CTAs in PRO-77 and will be consumed by the consulting page CTAs in PRO-78. `.bio-grid`, `.section-head`, `.experiment*` may be referenced from other pages later. Scoping them to a single Vue component would force a rename or a `:deep()` dance.
- Lifting verbatim from the prototype CSS preserves the line-range references in this plan and keeps the lifted styles trivially diffable against `_process/prototype/styles.css`.
- `tokens.css` → `base.css` → `chrome.css` → `sections.css` is a clean cascade: tokens define vars, base resets + utilities, chrome handles nav/footer, sections handles page-body content. Each layer depends only on layers above it.

**Trade-off.** No component-level style isolation. If a future page wants a visually different `.experiment` card variant, it will need a modifier class (e.g., `.experiment--compact`) rather than a scoped-style override. That's acceptable — it matches how the Motto system is authored and how `chrome.css` already operates.

### K2. `HeroSection.vue` is slot-driven, not prop-driven

**Decision.** `HeroSection` exposes named slots (`eyebrow`, `headline`, `sub`, `ctas`) rather than string props. The only props are `downArrow: boolean` (default `true`) and `downArrowHref: string` (default `"#work"`).

**Why.**
- The hero on `/` and the hero on `/consulting` (PRO-78) share the same chrome — eyebrow row, clamp-disp H1, sub paragraph, CTA row, optional down-arrow — but differ in every text string, in the H1 markup (one line vs. multiple, with or without an `<em>`/`<span>` for emphasis), and in the CTA composition (one button vs. two, filled vs. ghost). Encoding all of that as props produces an unwieldy API that fights every variation. Slots let each consumer write the markup it actually wants while the wrapper enforces the layout.
- The down-arrow is a controlled boolean because it's a yes/no architectural choice rather than a content variation. The href is a prop because it's a single string that's awkward to pass as a slot. Both have defaults that match the `/` use case so the page-level call site stays short.
- Default scoped slot is intentionally not used — every region is semantically named so consumers and reviewers can see at a glance which slot is which.

**API sketch.** *Directional guidance, not implementation specification.*

```
<HeroSection :down-arrow="true" down-arrow-href="#work">
  <template #eyebrow>
    <span class="dot" aria-hidden="true" />
    <span>CLAUDIO MENDONÇA — FOUNDER.DESIGNER.ENGINEER</span>
  </template>
  <template #headline>
    <h1>AI EXPERIMENTS</h1>
  </template>
  <template #sub>
    I build opinionated AI experimental tools. Use with moderation. This page is the index.
  </template>
  <template #ctas>
    <a class="btn btn-filled" href="#work">See the work <span class="btn-arrow" aria-hidden="true">→</span></a>
    <NuxtLink class="btn btn-ghost" to="/consulting">Consulting</NuxtLink>
  </template>
</HeroSection>
```

### K3. Stripes always render; image overlays them when present

**Decision.** The `.shot` frame always renders the `.stripes` div as the first child. When the `image` prop is a non-empty string, a `<NuxtImg>` renders on top with `position:absolute; inset:0; object-fit:cover`. No `v-if` gates the stripes element.

**Why.**
- This matches the prototype exactly: `_process/prototype/index.html` lines 67, 83, 99, 115 all render both `.stripes` and `<image-slot>` simultaneously; the image covers the stripes when present, and the stripes show through when the image is missing or broken (`NuxtImg`'s onerror fallback is implicit since the stripes are already painted underneath).
- A `v-if` on the stripes would create a brief flash of unstyled background between SSR markup and image load, especially over slow networks.
- The `idx` prop is rendered as `String(idx).padStart(2, '0')` inside the component, so the data file stores plain numbers (1, 2, 3, 4) and the component is responsible for presentation.

### K4. `app/data/experiments.ts` exports a named `experiments` constant + `Experiment` type

**Decision.** The data file exports `export interface Experiment { ... }` and `export const experiments: Experiment[] = [ ... ]`. No default export.

**Why.**
- Nuxt 4 auto-imports work cleanly with named exports from `app/data/`. A default export would require the page to spell out the relative import path (`import experiments from '~/data/experiments'`) anyway.
- Named exports make it trivial for tests (and PRO-78 if it ever wants to surface a subset of cards) to import both the type and the data without ceremony.
- The page uses `experiments` directly in `<template>` via `<script setup>`'s top-level binding; no `computed` is needed because the array is static.

### K5. `NuxtImg` instead of native `<img>`

**Decision.** Use `<NuxtImg src="/screenshots/<id>.jpg" :alt="alt" />` inside `ExperimentCard`. Do not use native `<img>` and do not configure a remote image provider.

**Why.**
- `@nuxt/image` is already a configured module (`nuxt.config.ts` line 8) — using it for the only images on the home page makes the dependency earn its keep.
- The placeholder PNG/JPEG payloads are 19–27KB each — small enough that the default `ipx` provider's lazy optimization is enough; no `densities`, no `placeholder`, no remote provider configuration.
- When real product screenshots replace the placeholders, `NuxtImg` will format-shift them to AVIF/WebP automatically; we don't need to revisit the markup.

---

## Output Structure

The plan creates the following new files (everything outside `_process/prototype/`):

```
app/
  components/
    HeroSection.vue          (new)
    ExperimentCard.vue       (new)
  data/
    experiments.ts           (new — type + seeded array)
  assets/
    css/
      sections.css           (new — page-section + button styles)
  pages/
    index.vue                (replaced)

public/
  screenshots/
    cutthecrap.jpg           (new — copy of home-grid.png)
    edge.jpg                 (new — copy of home-grid-bottom.png)
    squoosh.jpg              (new — copy of home-grid-captions.png)
    varro.jpg                (new — copy of home-grid-v2.png)

nuxt.config.ts               (modified — adds sections.css to css array)
```

`app/data/` does not exist yet; creating it is part of U3.

---

## Implementation Units

### U1. Lift page-section + button styles into `app/assets/css/sections.css`

**Goal.** Establish the global stylesheet that every other unit depends on. No components yet — just CSS in place and registered.

**Requirements.** R4, R8, R13, R14, plus button atoms required by R3.

**Dependencies.** None.

**Files.**
- `app/assets/css/sections.css` (new)
- `nuxt.config.ts` (modified — append `'~/assets/css/sections.css'` to the `css` array after `'~/assets/css/chrome.css'`)

**Approach.**

Lift each slice verbatim from `_process/prototype/styles.css` and concatenate in this order, with a `/* ---------- <slice> ---------- */` divider mirroring the prototype's banner style:

| Slice | Prototype lines | Notes |
| --- | --- | --- |
| Button atoms (`.btn`, `.btn-filled`, `.btn-ghost`, `.btn-arrow`) | 171–213 | `.btn-text` (lines 215–225) intentionally skipped — deferred. |
| Hero (`.hero`, `.hero-eyebrow`, `.hero-eyebrow .dot`, `.hero h1`, `.hero h1 .amp`, `.hero-sub`, `.hero-cta-row`, `.down-arrow`) | 275–326 | Take as-is. |
| Section head (`.section-head`, `.section-head .label`, `.section-head .label::before`, `.section-head h2`) | 328–357 | Take as-is. Used by the work section heading. |
| Experiments grid + card chrome (`.experiments-grid`, `.experiments-grid` mobile rule, `.experiment`, `.experiment .shot`, `.experiment .shot image-slot`, `.experiment .shot .placeholder`, hover transition, stripes pattern) | 366–414 | Replace `image-slot::part(image)` with `img` (R7); keep the stripes and 4:3 aspect-ratio rules verbatim. |
| Experiment caption (`.experiment-caption`, `.idx`, `.title-block`, `h3`, `.tag`, `.arrow`, hover translate, legacy-element reset) | 416–471 | Take as-is. Legacy reset block at 466–471 may be dropped since the new card never emits those elements — keep it as a defensive guard. |
| About / bio (`.bio-grid`, `.bio-grid` mobile rule, `.bio-grid h2`, `.bio-body p`, `.bio-body p.secondary`) | 541–565 | Take as-is. |
| Reduced-motion override (new) | n/a | Append at the bottom: `@media (prefers-reduced-motion: reduce) { .experiment .shot img, .experiment .experiment-caption .arrow, .btn .btn-arrow { transition: none !important; } .experiment:hover .shot img, .experiment:hover .experiment-caption .arrow { transform: none !important; } }`. |

Confirm `nuxt.config.ts` `css` order ends up as: `tokens.css` → `base.css` → `chrome.css` → `sections.css`.

**Patterns to follow.** PRO-76 `app/assets/css/chrome.css` — same lifting style, same line-range commentary at the top of the file.

**Test scenarios.**
- Test expectation: none — pure stylesheet additions, verified visually by U6 and by the U7 browser-test pass. The U6 page render and U7 verification together prove the cascade order and selector availability.

**Verification.** `pnpm dev` boots without console errors; `view-source` of `/` shows `sections.css` linked after `chrome.css`; no visual regression on `/consulting` (which still has no consumers of the new CSS).

---

### U2. Place placeholder screenshots in `public/screenshots/`

**Goal.** Drop in four placeholder image files so the cards render real `<img>` elements on day one.

**Requirements.** R11.

**Dependencies.** None.

**Files.**
- `public/screenshots/cutthecrap.jpg` (new — copy of `_process/prototype/screenshots/home-grid.png`)
- `public/screenshots/edge.jpg` (new — copy of `_process/prototype/screenshots/home-grid-bottom.png`)
- `public/screenshots/squoosh.jpg` (new — copy of `_process/prototype/screenshots/home-grid-captions.png`)
- `public/screenshots/varro.jpg` (new — copy of `_process/prototype/screenshots/home-grid-v2.png`)

**Approach.**

Use the file utility to confirm each source file is JPEG bytes (already verified — all six prototype mockups are JPEG/JFIF despite the `.png` extension). Then `cp <source> <dest>` for each mapping, renaming to `.jpg`. The unused prototype mockups (`home-hero.png`, `home-work.png` — duplicates of each other) are left in `_process/` and not copied.

The mapping is placeholder-only — none of these mockups depict the actual products. They exist to verify the layout and image-loading path. Real screenshots are explicitly deferred (see Scope Boundaries).

**Patterns to follow.** None — file copy.

**Test scenarios.**
- Test expectation: none — static asset placement, verified in U7 by asserting each card's `<img>` has a non-zero natural width.

**Verification.** `ls public/screenshots/` returns four files; `file public/screenshots/*.jpg` reports JPEG bytes for each.

---

### U3. Create the typed experiments data file

**Goal.** Stand up `app/data/experiments.ts` with the `Experiment` interface and the four pre-seeded entries. This is the source of truth the page iterates over.

**Requirements.** R9, R10, R16.

**Dependencies.** None — independent of U1 and U2.

**Files.**
- `app/data/experiments.ts` (new)

**Approach.**

Export an `Experiment` interface and a `experiments: Experiment[]` constant. Field order in each object matches the interface declaration so the file diffs cleanly when new entries are added. URLs and image paths follow R10 verbatim. Mark unknown URLs with the literal `TODO(claudio)` string in a comment on the line above (so a grep across the repo finds them) while keeping the runtime value as `'#'` so `<a href>` stays valid:

```
// TODO(claudio): real URL
url: '#',
```

Squoosh keeps its real URL (`https://squoosh.ccmdesign.com`) — no TODO needed.

The page renders `idx` from the array position (`index + 1`), so the data file does not store an `idx` field; `id` is the slug used for the image filename.

**Patterns to follow.** No prior data file in the repo. Use the same TypeScript style as `nuxt.config.ts` (single quotes, no semicolons inside object literals, trailing commas, 2-space indent).

**Test scenarios.**
- Test expectation: none — pure data file. Correctness is proven by U7 asserting 4 cards render with the expected titles and tags.

**Verification.** `pnpm typecheck` (if configured) passes; otherwise `pnpm dev` boots without TS errors when U6's `index.vue` imports the array.

---

### U4. `ExperimentCard.vue` — leaf component

**Goal.** A reusable, prop-driven card that renders the shot frame and caption row. CSS-only hover. SSR-safe.

**Requirements.** R5, R6, R7, R14, R15.

**Dependencies.** U1 (consumes `.experiment*` styles), U2 (the image files it links to need to exist for visual verification, but the component itself does not require them at import time).

**Files.**
- `app/components/ExperimentCard.vue` (new)

**Approach.**

Single-file component with `<script setup lang="ts">`. Define `Props` interface with `idx: number; title: string; tag: string; href: string; image?: string; alt: string`. Compute `idxLabel = String(idx).padStart(2, '0')` in setup. Template renders:

```
<a class="experiment" :href role="listitem" target="_blank" rel="noopener" :aria-label="title">
  <div class="shot">
    <div class="stripes" aria-hidden="true" />
    <NuxtImg v-if="image" :src="image" :alt loading="lazy" />
  </div>
  <div class="experiment-caption">
    <span class="idx">{{ idxLabel }}</span>
    <div class="title-block">
      <h3>{{ title }}</h3>
      <span class="tag">{{ tag }}</span>
    </div>
    <span class="arrow" aria-hidden="true">↗</span>
  </div>
</a>
```

No `<style>` block — all styles come from `sections.css`.

External links default to `target="_blank" rel="noopener"` to match the prototype. The component does not distinguish internal from external URLs in PRO-77 — every seeded entry is external.

**Patterns to follow.** Match `SiteFooter.vue` for static-template + no-state structure. Match `SiteNav.vue` for `<script setup>` style and prop-typing conventions.

**Test scenarios.**
- Happy path: given `idx=1, title="Cut The Crap", tag="YOUTUBE VIDEOS AS TWEETS", href="#", image="/screenshots/cutthecrap.jpg", alt="Cut The Crap"`, the component renders one `<a class="experiment">`, the `.idx` element contains the literal `"01"`, the `.title-block h3` contains the title, the `.tag` contains the tag, the inner `<img>` (rendered by `NuxtImg`) has `src` pointing at the path, the `<a>` has `aria-label="Cut The Crap"`.
- Edge case — idx padding: `idx=10` renders `"10"` (no over-padding); `idx=1` renders `"01"`.
- Edge case — missing image: when `image` is `undefined` or `""`, no `<img>` is rendered but the `.stripes` element is still present in the DOM. The card still renders all caption content.
- Edge case — external attributes: the `<a>` has both `target="_blank"` and `rel="noopener"`.
- Edge case — empty title or tag: nothing crashes; the slot just renders empty text. (Not a meaningful failure mode for now; assert no exception.)
- Integration: Covers AE for R16. Rendering `<ExperimentCard v-for="(e, i) in experiments" :key="e.id" :idx="i+1" :title="e.title" :tag="e.tag" :href="e.url" :image="e.image" :alt="e.alt" />` against an array of length 5 produces 5 `.experiment` anchors with no layout edits. (Proved by U6's walkthrough; no separate test harness exists yet.)
- SSR: rendering the component server-side produces complete HTML; no `window` or `document` reference appears in setup.

**Verification.** Component renders inside the page in U6 with no Vue warnings. The 4 cards on `/` each show: a 4:3 frame containing image + stripes, an `01–04` index, an uppercase title, an uppercase letterspaced tag, and a `↗` arrow that translates on hover (visually verified in U7).

---

### U5. `HeroSection.vue` — slot-driven reusable hero

**Goal.** A reusable hero whose only props gate the down-arrow and its href; everything else is slot content.

**Requirements.** R2, R3, R4, R15.

**Dependencies.** U1 (consumes `.hero*` and button atoms).

**Files.**
- `app/components/HeroSection.vue` (new)

**Approach.**

Single-file component with `<script setup lang="ts">` defining props `{ downArrow?: boolean (default true); downArrowHref?: string (default '#work') }`. Template:

```
<section class="hero">
  <div class="shell">
    <div class="hero-eyebrow"><slot name="eyebrow" /></div>
    <slot name="headline" />
    <p class="hero-sub"><slot name="sub" /></p>
    <div class="hero-cta-row"><slot name="ctas" /></div>
    <a v-if="downArrow" :href="downArrowHref" class="down-arrow" aria-label="Scroll to work">↓</a>
  </div>
</section>
```

The `headline` slot intentionally lives outside any wrapper so consumers control the heading level (an `<h1>` on home, possibly an `<h1>` with split spans on consulting). The `sub` slot is wrapped in `<p class="hero-sub">` because every consumer wants a paragraph; if a future consumer needs different markup, swap to a wrapperless slot then.

The component has no scoped styles. The down-arrow's `aria-label` is hard-coded ("Scroll to work"); if PRO-78 needs to override the label, expose a `downArrowLabel` prop in that ticket — for PRO-77 the label is correct.

**Patterns to follow.** No similar slot-driven component exists yet in the repo. Use Vue 3 `defineProps` with `withDefaults` for the boolean default.

**Test scenarios.**
- Happy path: rendering `<HeroSection>` with all four named slots filled produces a `<section class="hero">` containing each slot's content in order, plus the `<a class="down-arrow">` pointing at `#work`.
- Props default: when no props are passed, the down-arrow renders with `href="#work"` and label "Scroll to work".
- Prop override — downArrow false: `<HeroSection :down-arrow="false">` renders the section without the down-arrow `<a>`.
- Prop override — downArrowHref: `<HeroSection down-arrow-href="#services">` renders the down-arrow pointing at `#services`.
- Empty slots: omitting the `eyebrow` slot leaves `.hero-eyebrow` empty but still in the DOM. (Acceptable — visually it collapses because the dot and caption are gone; the spacing rule on `.hero-eyebrow { margin-bottom }` still fires, so the H1 sits where it would with the eyebrow present. PRO-78 can revisit if needed.)
- SSR: server render produces complete HTML; no client-only API referenced.

**Verification.** The component renders inside `index.vue` in U6 with the prototype-matching eyebrow, H1, sub, two CTAs, and down-arrow. Visual diff against `_process/prototype/index.html` lines 35–53 in the browser-test pass (U7).

---

### U6. Compose the home one-pager in `app/pages/index.vue`

**Goal.** Replace the placeholder page with the real home content. Hero + work section + about section. The DOM contains exactly four `.experiment` anchors sourced from the data array.

**Requirements.** R1, R3, R8, R12, R16.

**Dependencies.** U1, U2, U3, U4, U5.

**Files.**
- `app/pages/index.vue` (replaced)

**Approach.**

`<script setup lang="ts">` imports the experiments array via Nuxt 4 auto-import (`import { experiments } from '~/data/experiments'` — Nuxt 4 picks this up from `app/data/` as a non-auto-imported module since `app/data/` is not in the auto-import dirs; explicit import keeps this readable). Template:

```
<HeroSection>
  <template #eyebrow>
    <span class="dot" aria-hidden="true" />
    <span>CLAUDIO MENDONÇA — FOUNDER.DESIGNER.ENGINEER</span>
  </template>
  <template #headline>
    <h1>AI EXPERIMENTS</h1>
  </template>
  <template #sub>
    I build opinionated AI experimental tools. Use with moderation. This page is the index.
  </template>
  <template #ctas>
    <a class="btn btn-filled" href="#work">
      See the work
      <span class="btn-arrow" aria-hidden="true">→</span>
    </a>
    <NuxtLink class="btn btn-ghost" to="/consulting">Consulting</NuxtLink>
  </template>
</HeroSection>

<section id="work">
  <div class="shell">
    <div class="section-head">
      <span class="label">EXPERIMENTS —</span>
      <h2></h2>
    </div>
    <div class="experiments-grid" role="list" aria-label="Experiments">
      <ExperimentCard
        v-for="(item, i) in experiments"
        :key="item.id"
        :idx="i + 1"
        :title="item.title"
        :tag="item.tag"
        :href="item.url"
        :image="item.image"
        :alt="item.alt"
      />
    </div>
  </div>
</section>

<section id="about">
  <div class="shell">
    <div class="bio-grid">
      <div>
        <span class="label">— About</span>
        <h2>About.</h2>
      </div>
      <div class="bio-body">
        <p>I'm Claudio Mendonça, design engineer, working at the intersection of design, code, and AI.</p>
        <p class="secondary">The products on this page are the experiments I'm shipping under my own name. The <NuxtLink class="link-underline" to="/consulting">consulting page</NuxtLink> is what I do for clients: agent architecture, AI automation, and hands-on training for teams.</p>
        <p class="secondary">Based in beautiful British Columbia. Available for a small number of engagements at a time.</p>
      </div>
    </div>
  </div>
</section>
```

Notes:
- The empty `<h2></h2>` inside `.section-head` is preserved from the prototype (line 60). The visual heading is the cards themselves; the `.section-head .label` carries the textual label. (Accessibility note in U7: confirm whether an empty `<h2>` is acceptable to a screen-reader walkthrough or whether the `<h2>` should be removed entirely. If the latter, drop the `<h2>` and adjust the `.section-head` grid in `sections.css` — flagged as an Open Question.)
- The about block's left-column label uses the existing `.label` class from `sections.css` (lifted from prototype `.section-head .label`). The prototype's `index.html` inlined the label styles (lines 136–138); we use the class instead.
- No `<style>` block on the page.

**Patterns to follow.** Match the page structure in PRO-76's `app/pages/index.vue` (placeholder) — single `<template>` block, no `<script>` if no logic, but PRO-77 needs `<script setup lang="ts">` for the data import.

**Test scenarios.**
- Happy path — render: `/` returns 200 and the response HTML contains exactly one `<section class="hero">`, one `<section id="work">`, one `<section id="about">`, and exactly four `<a class="experiment">` elements inside `.experiments-grid`.
- Covers AE (R16): the four cards render `01–04` in their `.idx` elements with titles "Cut The Crap", "Edge", "BATCH SQUOOSH", "Varro" in that order, and tags from the data file.
- Covers AE (R16 — extensibility): mentally walking through adding a 5th entry — append `{ id: 'newproduct', title: 'New', tag: '…', url: '#', image: '/screenshots/newproduct.jpg', alt: 'New' }` and copy a JPEG to `public/screenshots/newproduct.jpg` — and confirming nothing else in this file or any component needs to change. (Verified by inspection during code review; no array-length assumption appears anywhere in markup or styles.)
- Anchors: the document contains `id="work"` and `id="about"` and these match the route-aware hrefs in `SiteNav.vue` (`#work`, `#about` on `/`).
- About link: the inline "consulting page" link is a `<NuxtLink to="/consulting">`, not an `<a href>`, so client-side navigation works.
- SSR: the page renders fully on the server; view-source contains all four card titles before any JS runs.

**Verification.** Open `/` in the dev server; visually compare against `_process/prototype/index.html`. The DOM assertion above is satisfied. No console errors, no Vue warnings, no broken images.

---

### U7. Browser verification

**Goal.** Confirm the page actually renders and behaves correctly across the breakpoints the spec calls out.

**Requirements.** R1, R6, R7, R8, R14, R16.

**Dependencies.** U1–U6.

**Files.**
- None — this is verification, not implementation. No new test files since the repo has no test harness yet (PRO-75 and PRO-76 verified via the `/browse` skill the same way).

**Approach.**

Use the `/browse` skill to load the running dev server and assert:

1. `/` returns 200 with no console errors.
2. Hero: H1 reads "AI EXPERIMENTS", uppercased, large-display sized. Eyebrow row shows dot + caption. Two CTAs visible, "See the work" is filled, "Consulting" is ghost. Down-arrow visible at bottom of hero section, links to `#work`.
3. Clicking "See the work" or the down-arrow scrolls to the work section (anchor jump).
4. Work section: `.experiments-grid` shows 2 columns at viewport width 1024px and 1 column at viewport width 600px (collapse rule at 760px). Exactly 4 cards visible.
5. Each card shows its image (no 404 in the network panel). Each card's `.idx` shows `01`, `02`, `03`, `04` respectively. Each card's hover state scales the image and translates the arrow.
6. About section: 2 columns at 1024px (1fr 1.4fr), 1 column at 600px. The "consulting page" link navigates to `/consulting` without a full reload.
7. Reduced-motion check: when DevTools "Emulate CSS `prefers-reduced-motion: reduce`" is active, hovering a card does not apply the scale or translate (or applies them instantly).
8. SiteNav still works: clicking Experiments scrolls to `#work`; clicking About scrolls to `#about`.

**Patterns to follow.** PRO-75 and PRO-76 browser-test runs documented in `docs/solutions/PRO-75-browser-test/` and `docs/solutions/PRO-76-browser-test/`. Create `docs/solutions/PRO-77-browser-test/` for the artifacts.

**Test scenarios.**
- All assertions listed in Approach pass.
- Add a 5th entry to `app/data/experiments.ts` locally (don't commit), reload, confirm 5 cards render in a 2-column grid with the 5th wrapping to a new row. Revert the local edit. (Manual proof of R16; not a regression test.)

**Verification.** All eight assertions above are checked off. Screenshots of `/` at 1280px and at 600px are saved under `docs/solutions/PRO-77-browser-test/`.

---

## Sequencing

```
U1 (styles) ──┐
              ├──> U4 (ExperimentCard) ──┐
U2 (assets) ──┤                           ├──> U6 (page) ──> U7 (verify)
U3 (data) ───┘                            │
              └──> U5 (HeroSection) ─────┘
```

U1, U2, U3 are independent and can land in any order or in parallel. U4 and U5 depend on U1. U6 depends on everything before it. U7 depends on U6.

---

## Risks and Mitigations

- **Risk — `NuxtImg` default behavior differs from native `<img>` on placeholder image paths.** The `@nuxt/image` module's default `ipx` provider expects images under `public/` and may transform them. *Mitigation:* test with a real image (U2 lands assets first) and confirm in U7 that the network panel returns 200 for each card's image. If `ipx` produces unexpected output, swap to `<img>` for PRO-77 and revisit once real product screenshots land.
- **Risk — Empty `<h2>` in `.section-head` flagged by accessibility audit.** *Mitigation:* note as an Open Question; either keep it (matching prototype) and rely on the visible `.label`, or drop the `<h2>` entirely. Defer to U7 verification.
- **Risk — Mobile breakpoint collision.** The grid collapse fires at 760px; the SiteNav's "hide About" fires at 640px. Between 640px and 760px, the about link is hidden in the nav but visible as a target on the page. *Mitigation:* this is by design (the about anchor still works); no fix needed.
- **Risk — `<NuxtLink>` inside a `<p>` paragraph (about block).** Should be safe; `NuxtLink` renders an `<a>` which is valid phrasing content. *Mitigation:* spot-check in U7.

---

## Open Questions (deferred to implementer)

- Whether to keep the empty `<h2></h2>` in `.section-head` or drop it. Prototype keeps it; an a11y check may want it gone. Decide during U7.
- Whether `NuxtImg` needs an explicit `width`/`height` to avoid CLS — defer until U7 if Lighthouse complains.
- Whether `target="_blank"` on the cutthecrap / edge / varro cards is correct given they currently point at `#`. Leave `target="_blank"` to match the prototype; revisit when real URLs land.

---

## Acceptance Criteria (from ticket)

- **AC1.** Home (`/`) renders Hero + Experiments grid + About in that visual order.
- **AC2.** The Experiments grid contains exactly four `.experiment` anchors, sourced by iterating `app/data/experiments.ts`.
- **AC3.** Adding a fifth product is one new entry in `app/data/experiments.ts` (plus one image file in `public/screenshots/`). No edit to any `.vue` or `.css` file. Proved by walkthrough in U7.
- **AC4.** Below 760px the grid collapses to a single column; the About block collapses to a single column below 800px. Both transitions happen via CSS lifted from the prototype, not new media queries.
- **AC5.** Hovering a card scales the image by `1.02` and translates the arrow `4px right, 4px up`, both with the prototype's `cubic-bezier(.2,.7,.2,1)` curve. Reduced-motion users see neither.
- **AC6.** The nav's `#work` and `#about` anchors resolve to the new `<section id="work">` and `<section id="about">` on this page.
