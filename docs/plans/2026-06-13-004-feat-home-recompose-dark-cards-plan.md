---
title: "feat: Home recompose — dark experiment cards + about (PRO-112)"
type: feat
status: active
date: 2026-06-13
ticket: PRO-112
origin: docs/plans/2026-06-13-003-feat-hero-webgl-kinetic-plan.md
---

# feat: Home recompose — dark experiment cards + about (PRO-112)

## Summary

Redesign 4/6 of the home page on the merged dark system. The hero is already recomposed (PRO-111: `HeroSection` + `KineticHeading` rotating words + `MagneticButton`). This cycle finishes the page below the hero: make `ExperimentCard.vue` a genuinely dark card (raised surface, mono accent index, image reveal + parallax on scroll via `useScrollReveal`/ScrollTrigger, hover scale), recompose the `#work` grid and `#about` section in `index.vue` with SSR-safe reveals, port the `#work`/`#about` section styles in `sections.css` to the dark semantic tokens, and regenerate the mesh-gradient screenshots darker so they sit on `--ink` without reading as bright smudges.

Same copy, same data (`app/data/experiments.ts`, 5 entries), same anchors (`#work`, `#about`). The progressive-enhancement contract is the hard constraint: server-rendered HTML and the no-JS / reduced-motion render must show all content with no hidden start state — the hidden state is applied only on the client in `onMounted`, which `useScrollReveal` already enforces.

---

## Problem Frame

The chrome (nav/footer/cursor) and hero are dark and on the new tokens, but the body of the home page still renders the original light-Motto layout *remapped* to dark via the legacy `--color-*` token aliases. That remap keeps it legible but it is not a deliberate dark composition: the experiment cards have no raised surface, the index label uses the display font rather than mono, there is no scroll reveal/parallax (the one composable built for it, `useScrollReveal`, has no consumer yet), and the mesh-gradient screenshots were authored saturated for a card frame on white so they glow on ink.

`useScrollReveal` (PRO-109) already encodes the exact progressive-enhancement contract the ticket demands: no-op on SSR, no hidden start state until `onMounted`, reduced-motion stays visible. This cycle is its first real consumer — the risk is using it correctly (wrapping content so the SSR render is complete) rather than building anything new.

---

## Requirements

- **R1** — `ExperimentCard.vue` renders as a dark card: raised surface behind the shot, mono index label tinted with the accent, accent-on-hover index, hover image scale. (ticket Scope bullet 1)
- **R2** — Card image gets a scroll reveal and a subtle parallax driven by ScrollTrigger, enhancement-only. (ticket Scope bullet 1)
- **R3** — `index.vue` `#work` grid and `#about` section are recomposed with reveals wrapped so SSR/no-JS shows full content; section ids `#work` and `#about` are preserved. (ticket Scope bullet 2)
- **R4** — Cards link out in a new tab with `target="_blank" rel="noopener"`. (ticket AC)
- **R5** — `#work` grid + `#about` section styles in `sections.css` are ported to the dark semantic tokens (`--ink`/`--raised`/`--paper`/`--dim`/`--accent`/`--hairline`). (ticket Scope bullet 3)
- **R6** — Mesh-gradient screenshots are regenerated darker via `_process/mesh-gradients.mjs` only if they read too bright on ink. (ticket Scope bullet 4)
- **R7** — Reveals enhance, never hide: no hidden start state in SSR HTML; reduced-motion and JS-off both show all 5 experiment titles + the about copy. View-source contains all content. (ticket AC)
- **R8** — Full home scroll works at 375 / 768 / 1280 / 1440; `#work`/`#about` anchors land; `/about` redirect still lands on `#about`. (ticket AC)
- **R9** — `pnpm typecheck` + `pnpm lint` + `pnpm generate` green; no console errors. (ticket AC)

---

## Key Technical Decisions

- **KTD1 — Image parallax via ScrollTrigger scrub, not a second composable.** `useScrollReveal` handles the one-shot reveal (opacity + y, `once: true`). Parallax is a continuous scrubbed tween — a different shape — so it is implemented inline in `ExperimentCard.vue`'s own `onMounted` using the same client-only dynamic-import + reduced-motion-bail + `onScopeDispose`-kill pattern that `useScrollReveal` and `HeroScene` already follow. Keeping the reveal in the shared composable and the parallax local avoids over-generalizing a one-consumer effect.
- **KTD2 — Parallax moves a slightly oversized inner image, never the card box.** The `.shot` frame keeps `overflow: hidden` and a fixed `aspect-ratio`; the `<img>` inside is scaled past 100% height and its `y` is nudged within that overflow. This means layout never shifts (no CLS, anchors stay put) and the parallax degrades to a static centered image when JS is off.
- **KTD3 — Reveal targets the card, parallax targets the image; both bail on reduced-motion and SSR.** Reduced-motion users and no-JS users see the fully-composed static dark card. This is the R7 contract; it is satisfied by applying every transform only inside `onMounted` after a `reduced.value` early return.
- **KTD4 — Restyle on dark semantic tokens, not the legacy aliases.** The `#work`/`#about`/card rules move from `--color-pitch-black`/`--color-cloud-gray`/`--color-ash-text` to `--paper`/`--raised`/`--dim`/`--accent`/`--hairline`. Hairline separators use `--hairline` (or `--hairline-solid` where rgba layering is wrong). This makes the dark intent explicit and decouples the home body from the legacy remap, matching how chrome.css and the hero already read the new tokens.
- **KTD5 — Mono index label uses `--font-mono`.** The ticket calls for a "mono index label"; the index switches from `--font-disp` to `--font-mono` and is tinted `--dim`, going `--accent` on hover/focus. Keep `padIndex` (2-digit `01`…`05`) from `app/utils/format.ts`.
- **KTD6 — Regenerate screenshots darker by adding a dark base wash, keeping hues.** `mesh-gradients.mjs` gets a low-luminance base per palette and a dark multiply/overlay rect so the blobs keep their identity but the card reads as a deep lit surface on ink, not a bright tile. Decision gated on R6: only regenerate if a visual check at the breakpoints shows the current art too bright. Output paths and the 5 ids are unchanged so `experiments.ts` needs no edit.

---

## Scope Boundaries

In scope: `ExperimentCard.vue`, the `#work` and `#about` blocks of `index.vue`, the card/`#work`/`#about` rules in `sections.css`, and (conditionally) the `_process/mesh-gradients.mjs` palettes + regenerated `public/screenshots/*.jpg`.

Out of scope:
- The hero — already recomposed in PRO-111; this cycle must not undo `KineticHeading`/`MagneticButton`/`HeroScene`.
- `/consulting` page and `ConsultingEntry.vue` — separate cycle.
- `app/data/experiments.ts` data shape and URLs — unchanged; cards iterate it as-is.
- `useScrollReveal.ts`, `gsap.client.ts`, `lenis.client.ts`, tokens, base.css, chrome.css — consumed, not modified.

### Deferred to Follow-Up Work
- Real product screenshots (owner-deferred, tracked in `todos/PRO-80-residual.md`) — the placeholders, darkened, ship here.

---

## High-Level Technical Design

Per-card client enhancement lifecycle (enhancement only; SSR render is the complete static card):

```
SSR / no-JS render:  <a.experiment> → <div.shot>(stripes + <img> static) + caption(mono idx, title, tag, arrow)   [fully visible]
                                   │
                              client onMounted
                                   │
                    reduced-motion? ──yes──▶ no-op (static card stays)
                                   │ no
                                   ▼
        useScrollReveal(cardEl)          inline parallax(imgEl)
         set opacity:0,y:24 (client)      ScrollTrigger scrub: img y drifts
         ScrollTrigger once → tween in    within .shot overflow on scroll
                                   │
                              onScopeDispose → kill triggers + tweens
```

---

## Implementation Units

### U1. Dark `ExperimentCard.vue` — surface, mono accent index, hover, reveal + parallax

**Goal:** Turn the card into a deliberate dark card and wire its scroll enhancements.
**Requirements:** R1, R2, R3 (markup contract), R4, R7.
**Dependencies:** none.
**Files:**
- `app/components/ExperimentCard.vue` (modify)
- `app/components/__tests__/ExperimentCard.spec.ts` (create — colocated test; confirm the repo's existing test dir convention and mirror it)

**Approach:**
- Keep the existing prop contract (`idx`, `title`, `tag`, `href`, `image?`, `alt`, `ariaLabel?`) and the `<a class="experiment" target="_blank" rel="noopener">` outer element (R4 already satisfied — preserve it).
- Add a template `ref` on the card root (for `useScrollReveal`) and on the `<img>` (for parallax).
- Call `useScrollReveal(cardRef, { y: 24 })` at setup — it is SSR-safe and only acts on the client.
- Add an `onMounted` parallax: early-return on `reduced.value` (reuse `useReducedMotion`) and when `!imgRef.value`; dynamically `import('gsap')` + `import('gsap/ScrollTrigger')`, register, create a scrubbed `gsap.to(img, { yPercent: <small>, scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } })`. Kill the trigger + tween in `onScopeDispose`. Mirror the import/teardown pattern in `useScrollReveal.ts` and `HeroScene.vue`.
- Index label markup stays `<span class="idx">{{ idxLabel }}</span>`; styling (mono + accent) lands in U3.

**Patterns to follow:** `app/composables/useScrollReveal.ts` (client-only import, reduced-motion bail, scope dispose); `app/components/HeroScene.vue` (dynamic GSAP import kept out of SSR graph); `app/components/KineticHeading.vue` (onMounted + onBeforeUnmount teardown).

**Test scenarios:**
- Renders an `<a>` with `href` = prop, `target="_blank"`, `rel="noopener"`. Covers R4.
- Renders the zero-padded index (`idx=3` → `03`), the title, and the tag text.
- Uses `ariaLabel` as the link's accessible name when provided; falls back to `title` when absent.
- Renders the `<img>` with `alt` when `image` is set; omits the `<img>` (stripes-only) when `image` is absent.
- SSR/static render: mounting without triggering `onMounted` effects leaves the card and image fully visible (no inline `opacity:0`/transform in the server markup). Covers R7.

**Verification:** Component test green; card markup unchanged for the link contract; no GSAP import appears in the SSR/server bundle (dynamic import only).

---

### U2. Recompose `#work` grid + `#about` in `index.vue` (SSR-safe reveals)

**Goal:** Recompose the body so the section heads and about block reveal on scroll while staying fully present in SSR/no-JS.
**Requirements:** R3, R7, R8.
**Dependencies:** U1 (card enhancements), U3 (styles — can land in parallel, page references classes).
**Files:**
- `app/pages/index.vue` (modify — `#work` and `#about` blocks only; leave the `<HeroSection>` block intact)

**Approach:**
- Keep `<section id="work">` and `<section id="about">` and the `.shell` wrappers — anchors and `/about` redirect depend on these ids (R8).
- Keep the `experiments` import and the `<ul class="experiments-grid">` `v-for` over `experiments` with the existing `ExperimentCard` prop bindings (per-card reveal/parallax now lives inside the card from U1, so the page does not need to add per-card refs).
- Add a reveal to the `#work` section head and to the `#about` bio block: attach a `ref` to each and call `useScrollReveal(ref)` for the head, and `useScrollReveal(ref, { childSelector: '...', stagger: 0.08 })` for the about paragraphs if a staggered entrance reads well — both are no-ops on SSR so the copy is always in the served HTML.
- Do not animate the `<ul>`/cards from the page; the cards self-reveal (U1) to keep stagger localized and avoid double-hiding.
- Verify the served markup (via `pnpm generate` output / view-source) contains all 5 experiment titles and the full about copy.

**Patterns to follow:** existing `index.vue` hero block (slot usage, `useHead`/`useSeoMeta` left untouched); `useScrollReveal` option API.

**Test scenarios:** `Test expectation: none -- page composition is covered by the U1 component test and STEP 6 browser/SSR view-source checks (all 5 titles + about copy present with JS off).` If the repo has a page-level smoke test convention, add an assertion that the rendered page contains the 5 titles and the `#work`/`#about` section ids.

**Verification:** `#work`/`#about` ids present; `pnpm generate` output HTML contains all 5 titles + about paragraphs; reveals only attach client-side.

---

### U3. Dark `#work` grid + card + `#about` styles in `sections.css`

**Goal:** Port the card, grid, and about rules to the dark semantic tokens and add the mono/accent index treatment.
**Requirements:** R1, R5, R7 (reduced-motion override).
**Dependencies:** none (U1/U2 reference these class names).
**Files:**
- `app/assets/css/sections.css` (modify — `.experiments-grid`, `.experiment*`, `.shot`, `.stripes`, `.experiment-caption*`, `.idx`, `.bio-grid*`, `.bio-body*`, and the reduced-motion block)

**Approach:**
- Card surface: give `.experiment .shot` a `--raised` background and keep `overflow: hidden` + `aspect-ratio` (parallax needs the overflow; KTD2). Hairline borders (caption top border, grid top border) move from `--color-pitch-black` to `--hairline`/`--hairline-solid`.
- Index: `.experiment-caption .idx` → `font-family: var(--font-mono)`, color `--dim`; on `.experiment:hover .idx` / `.experiment:focus-visible .idx` → `--accent` (KTD5, R1).
- Hover scale stays on `.experiment:hover .shot img` (already present); confirm it reads on the raised surface.
- Title/tag/about colors → `--paper` (titles), `--dim` (tags, secondary body). About `.bio-grid h2` and `.bio-body p` repointed to dark tokens.
- Parallax-safe image: ensure `.experiment .shot img` can be translated within the frame (e.g. height slightly above 100% / object-fit cover) without revealing the `--raised` edge.
- Extend the existing `@media (prefers-reduced-motion: reduce)` block so the new index color transition (if any) and any image transform are neutralized, consistent with R7/R14 precedent already in the file.
- Keep the `.stripes` fallback (shows when image missing) but retune its rgba so it reads on `--raised`, not white.

**Patterns to follow:** existing dark token usage in `app/assets/css/chrome.css` and the hero rules already in `sections.css`; the existing reduced-motion override block at the bottom of `sections.css`.

**Test scenarios:** `Test expectation: none -- pure styling; verified visually in STEP 6 at all four breakpoints (light-on-dark legibility, hover scale, accent index, missing-image stripes fallback) and via the reduced-motion emulation check.`

**Verification:** Cards render as dark raised surfaces with mono dim index → accent on hover; about reads light-on-dark; reduced-motion emulation shows no motion; no contrast regressions.

---

### U4. Darken mesh-gradient screenshots (conditional — R6)

**Goal:** Regenerate the placeholder art so it sits on `--ink` as a deep lit surface, only if the current art reads too bright.
**Requirements:** R6.
**Dependencies:** U3 (judge brightness against the final dark card surface).
**Files:**
- `_process/mesh-gradients.mjs` (modify — palette base values + a dark wash rect)
- `public/screenshots/{cutthecrap,edge,squoosh,varro,feedback}.jpg` (regenerate via `node _process/mesh-gradients.mjs`)

**Approach:**
- Gate: after U3, view the cards at the breakpoints. If the gradients glow / read brighter than the surrounding ink, regenerate; otherwise note "screenshots read fine on ink, not regenerated" and skip the file edits.
- If regenerating: lower each palette's `base` luminance and/or add a final dark overlay rect (e.g. a low-opacity `--ink`-ish multiply) under the grain rect so hues survive but overall value drops. Keep ids, dimensions (1848×1080), anchors, and output paths unchanged so `experiments.ts` is untouched.
- Re-run the generator and confirm all 5 files rewrote.

**Test scenarios:** `Test expectation: none -- asset generation; judged visually in STEP 6.`

**Verification:** Either a recorded "not needed" note, or 5 regenerated jpgs that read as deep surfaces on ink with hue identity intact.

---

## Verification Strategy

- `pnpm typecheck` + `pnpm lint` + `pnpm test` + `pnpm generate` all green (R9).
- Browser pass at 375 / 768 / 1280 / 1440: full scroll; cards visible and open in a new tab; `#work`/`#about` anchors land; `/about` → `#about`.
- Progressive enhancement (R7): with reduced-motion emulated AND with JS disabled (view-source of the generated HTML), all 5 experiment titles + the full about copy are present and visible — no hidden start state.
- No console errors at any breakpoint.

---

## Risks & Dependencies

- **R-A — Double-hiding content.** If both the page and the card try to hide+reveal the same nodes, content could flash or stay hidden. Mitigation: cards self-reveal (U1); the page only reveals the section head + about block (U2), never the `<ul>`/cards.
- **R-B — Parallax causing layout shift or anchor drift.** Mitigation: parallax moves an oversized inner image inside a fixed-aspect `overflow:hidden` frame (KTD2); the card box never moves.
- **R-C — GSAP entering the SSR graph.** Mitigation: all GSAP imports are dynamic, inside `onMounted`, after the reduced-motion bail — mirroring `useScrollReveal`/`HeroScene`. Confirmed by checking the server bundle has no static gsap import.
- **R-D — Screenshot regeneration drifting card identity.** Mitigation: keep hues/anchors/ids; only drop value. Gate the whole unit on a real brightness check (R6) rather than regenerating blindly.
