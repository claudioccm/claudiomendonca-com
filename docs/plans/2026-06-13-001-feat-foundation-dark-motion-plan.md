---
title: "feat: Foundation — dark system + motion platform (PRO-109)"
type: feat
status: active
created: 2026-06-13
ticket: PRO-109
---

# feat: Foundation — dark system + motion platform (PRO-109)

## Summary

First of a six-cycle redesign. This cycle installs the **foundation platform** every later cycle sits on: a dark design-token system, a film-grain/vignette dark canvas, a client-only motion stack (GSAP + ScrollTrigger + SplitText, Lenis smooth scroll, Three.js available for later WebGL work), and three motion composables. After this cycle the site renders dark and builds green even though individual sections are **not** restyled yet — "unstyled-but-present is fine" is the explicit bar.

No section/component redesign happens here. The goal is purely to lay rails: tokens, canvas, plugins, composables, and the global wiring in the default layout.

---

## Problem Frame

The site currently ships the light "Motto®" system (white canvas, blueprint grid, Inter/Oswald). The redesign moves to a dark, motion-rich aesthetic. Doing the whole redesign in one pass is risky — instead, cycle 1 establishes the platform so cycles 2–6 can restyle sections against a stable, dark, motion-capable base.

The central tension this cycle resolves: **change the design foundation to dark + motion without breaking the existing (still light-authored) components' ability to build and render.** Existing `chrome.css` and `sections.css` consume `--color-*` tokens heavily (`--color-pitch-black` ×42, `--color-canvas-white` ×9, `--color-ash-text` ×18, etc.). If those token names disappear, the existing components stop building/rendering. The plan must keep them resolvable while flipping the canvas dark.

---

## Requirements

Traced from the PRO-109 brief and acceptance criteria.

- **R1** — Install motion/3D deps via pnpm: `gsap` (v3.13+, all plugins free incl. ScrollTrigger + SplitText), `lenis`, `three` + `@types/three`.
- **R2** — Add one monospace font family via `@nuxt/fonts` in `nuxt.config.ts`; expose a `--font-mono` token.
- **R3** — Rewrite `tokens.css` to a dark palette using hex/rgba (NOT oklch/hsl): ink `#08080a`, raised `#101014`, hairline `rgba(255,255,255,.10)`, paper `#f3f2ee`, dim `#9a9aa2`, faint `#6a6a72`, accent `#6980ff` (+ `#9c98ef`, rare `#beee98`). Keep type scale + spacing + `.shell` tokens. Add mono font var.
- **R4** — Rewrite `base.css`: dark reset, body bg ink, film-grain + vignette overlay (replace the light blueprint grid), keep `.shell` + type utilities + `scroll-margin-top` anchor offset + reduced-motion `scroll-behavior`.
- **R5** — Client-only plugin `app/plugins/gsap.client.ts`: register ScrollTrigger + SplitText once.
- **R6** — Client-only plugin `app/plugins/lenis.client.ts`: init Lenis, drive ScrollTrigger via RAF; disable on `prefers-reduced-motion` and on coarse-pointer/touch (fall back to native scroll).
- **R7** — Composable `useReducedMotion` — reactive `matchMedia`.
- **R8** — Composable `useWebGLCapable` — false on reduced-motion / small viewport / low `hardwareConcurrency`|`deviceMemory`.
- **R9** — Composable `useScrollReveal` — SSR-visible; hidden start state set in `onMounted`; ScrollTrigger reveal.
- **R10** — Wire global components in `app/layouts/default.vue`: `GrainOverlay`, a `SmoothScroll` provider; add a page/layout transition.
- **R11** — `pnpm typecheck` + `pnpm lint` + `pnpm generate` all green; `pnpm dev` no console errors.
- **R12** — Body renders on dark ink; grain/vignette visible; existing pages still render (unstyled-but-present is fine).
- **R13** — `prefers-reduced-motion` disables Lenis (native scroll); no-JS view-source still has full content.
- **R14** — No SSR import of `three`/`gsap` (client chunks only).

---

## Key Technical Decisions

### KTD1 — Remap existing `--color-*` tokens to dark values; ADD new semantic tokens alongside

`chrome.css` and `sections.css` reference the old `--color-*` names in ~90 places and are **not** rewritten this cycle. To satisfy R12 ("existing pages still render") with a green build, `tokens.css` keeps every existing `--color-*` name but **changes its value** to a dark-appropriate equivalent (e.g., `--color-canvas-white` → ink-ish dark surface, `--color-pitch-black` → light paper text). This flips the canvas dark *for free* across already-built components without touching them. The brief's new palette (ink/raised/hairline/paper/dim/faint/accent/mono) is added as a **new semantic token set** that cycles 2–6 will adopt.

Rationale: the AC explicitly accepts "unstyled-but-present"; remapping is the lowest-risk way to a dark, green build. Net effect — old names map onto the new dark palette; new names are the canonical going-forward API.

### KTD2 — Motion stack is strictly client-only

`gsap`, its plugins, `lenis`, and `three` must never enter the SSR/prerender bundle (R14). All registration/initialization lives in `*.client.ts` plugins; composables that touch these libs use dynamic `import()` inside `onMounted`/client guards, never top-level static imports in SSR-reachable code. `nuxt generate` must emit full markup with the libs in client chunks only (verified by grepping prerendered HTML for absence of library identifiers and by `pnpm generate` success).

### KTD3 — Reveal/animation must be SSR-visible by default (progressive enhancement)

`useScrollReveal` must leave content **visible** in SSR/no-JS (R13: "no-JS view-source still has full content"). The hidden "start" state is applied only in `onMounted` (client), then ScrollTrigger animates it to revealed. This guarantees crawlers and no-JS users see everything, and avoids a flash-of-hidden-content for users who never run JS.

### KTD4 — Lenis disabled on reduced-motion and touch/coarse-pointer

Lenis hijacks native scrolling; that is hostile on touch devices and for reduced-motion users. The `lenis.client.ts` plugin checks `prefers-reduced-motion: reduce` and `(pointer: coarse)` and, when either is true, **does not** instantiate Lenis — native scroll is used and ScrollTrigger falls back to the default scroller. Satisfies R6 and R13.

### KTD5 — Page transition via `nuxt.config` `app.pageTransition`

`app.vue` already renders `<NuxtLayout><NuxtPage/></NuxtLayout>`. The simplest, generate-safe way to add a transition is `app.pageTransition` (a named CSS transition) in `nuxt.config.ts`, with the transition's keyframes/classes defined in `base.css`. This works with static generation and respects reduced-motion (transition CSS gated behind a non-reduced-motion media query). Avoids restructuring `app.vue`/`default.vue` markup.

### KTD6 — Monospace family choice

Add a single Google-hosted monospace via `@nuxt/fonts` (e.g., `JetBrains Mono` weight 500 to match the single-weight discipline already in use). Exposed as `--font-mono`. Only the family wiring + token are in scope; no component consumes it yet.

---

## Output Structure

New files this cycle (existing files modified in place are listed per-unit):

```
app/
  plugins/
    gsap.client.ts          # U4 — register ScrollTrigger + SplitText
    lenis.client.ts         # U5 — init Lenis, RAF-drive ScrollTrigger, capability gates
  composables/
    useReducedMotion.ts     # U6
    useWebGLCapable.ts      # U7
    useScrollReveal.ts      # U8
  components/
    GrainOverlay.vue        # U9 — film-grain + vignette overlay element
    SmoothScroll.vue        # U9 — provider wrapper (client-only motion context)
```

---

## Implementation Units

### U1. Install dependencies (gsap, lenis, three, @types/three)

**Goal:** Add the motion/3D libraries to the project so plugins and composables can import them.
**Requirements:** R1.
**Dependencies:** none.
**Files:** `package.json`, `pnpm-lock.yaml`.
**Approach:** `pnpm add gsap lenis three` (runtime deps) and `pnpm add -D @types/three`. `gsap`, `lenis`, `three` are used at runtime in client chunks, so they are dependencies, not devDependencies; `@types/three` is dev-only. Confirm `gsap` resolves to ≥3.13 (free plugins). Commit the updated lockfile.
**Patterns to follow:** existing `package.json` dependency/devDependency split.
**Test scenarios:** Test expectation: none — dependency install. Verified by `pnpm install` succeeding and lockfile updating.
**Verification:** `pnpm ls gsap lenis three @types/three` shows installed versions; lockfile changed.

---

### U2. Rewrite `tokens.css` — dark palette + remap + mono token

**Goal:** Dark token system. New semantic tokens added; existing `--color-*` names remapped to dark values; mono font var added; type scale + spacing + `.shell` tokens preserved.
**Requirements:** R3, R2 (token half), KTD1, KTD6.
**Dependencies:** U1 not required (pure CSS), but logically first in the styling group.
**Files:** `app/assets/css/tokens.css`.
**Approach:**
- Add new semantic tokens (the going-forward API): `--ink:#08080a; --raised:#101014; --hairline:rgba(255,255,255,.10); --paper:#f3f2ee; --dim:#9a9aa2; --faint:#6a6a72; --accent:#6980ff; --accent-alt:#9c98ef; --accent-rare:#beee98;`.
- Add `--font-mono` (e.g. `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`).
- Remap every existing `--color-*` name to a dark equivalent so existing components render on dark (KTD1): e.g. `--color-canvas-white` → `var(--ink)` or `#0c0c10`; `--color-pitch-black` → `var(--paper)`; `--color-charcoal-surface` → `var(--raised)`; `--color-cloud-gray` → `var(--raised)`; `--color-stone-accent`/`--color-input-border` → `var(--hairline)`-equivalent hex; `--color-ash-text` → `var(--dim)`; `--color-silver-text`/`--color-faint-gray` → `var(--faint)`; decorative `--color-vivid-purple`/`--color-electric-violet`/`--color-grass-green` keep their existing chromatic hex (they already match the new accents).
- Keep all `--text-*`/`--leading-*`, `--spacing-*`, `--section-gap`, radius, `--page-max`, `--page-pad-x` tokens unchanged.
- All values hex/rgba — NOT oklch/hsl (per brief and project rule).
**Patterns to follow:** existing `tokens.css` structure/comment style.
**Test scenarios:** Test expectation: none — token definitions (styling). Behavior verified downstream by U10 build + browser checks (dark canvas, contrast).
**Verification:** `tokens.css` defines all new + remapped tokens; no oklch/hsl present; `pnpm generate` still builds.

---

### U3. Rewrite `base.css` — dark reset + grain/vignette canvas

**Goal:** Dark reset; body on ink; film-grain + vignette overlay replacing the light blueprint grid; preserve `.shell`, type utilities, anchor `scroll-margin-top`, reduced-motion `scroll-behavior`.
**Requirements:** R4, R12, KTD1, KTD5 (transition CSS hook).
**Dependencies:** U2 (consumes new tokens).
**Files:** `app/assets/css/base.css`.
**Approach:**
- `html, body` background → `var(--ink)`, color → `var(--paper)`, keep font stack/weight/size/line-height.
- Replace the blueprint `background-image` grid stack on `body` with a subtle dark texture (very low-opacity noise/dot field is optional; the visible grain comes from the `GrainOverlay` component, U9). The `body::before` vignette is rewritten to a dark radial vignette (darken edges) instead of the white wash.
- Keep `*,*::before,*::after{box-sizing}`, font-smoothing, `.shell`, `.disp/.sans`, `.t-*`, color utility classes (`.ash/.silver/.faint` — now resolve to dark-appropriate values via remapped vars), `[id]{scroll-margin-top}` anchor offset, `img/svg`, `a`, `::selection` (invert to paper-on-ink), `section` padding + dividers (`section + section` border → `var(--hairline)` equivalent via remapped `--color-stone-accent`).
- Keep `@media (prefers-reduced-motion: reduce){ html{ scroll-behavior:auto } }`.
- Add page-transition CSS classes for KTD5 (e.g. `.page-enter-active/.page-leave-active` fade/translate), gated so the motion is removed under `prefers-reduced-motion: reduce`.
**Patterns to follow:** existing `base.css` section comments + structure.
**Test scenarios:** Test expectation: none — global styling. Verified by U10 browser checks (dark body, vignette visible) and `pnpm generate`.
**Verification:** body renders dark; vignette present; `.shell`/type utilities intact; transition classes defined and reduced-motion-gated.

---

### U4. `app/plugins/gsap.client.ts` — register ScrollTrigger + SplitText

**Goal:** Register GSAP plugins exactly once on the client.
**Requirements:** R5, R14, KTD2.
**Dependencies:** U1.
**Files:** `app/plugins/gsap.client.ts`.
**Approach:** Nuxt `defineNuxtPlugin`. Import `gsap`, `ScrollTrigger`, `SplitText` (top-level imports are fine — the `.client.ts` suffix keeps the whole module out of the SSR bundle). `gsap.registerPlugin(ScrollTrigger, SplitText)`. Optionally `provide` gsap on the nuxt app for typed access. Idempotent (Nuxt runs plugins once per client).
**Patterns to follow:** Nuxt 4 plugin conventions (`defineNuxtPlugin`).
**Test scenarios:** Test expectation: none — client plugin registration; covered by U10 "no console errors" + `pnpm dev` check, and the no-SSR-import grep in U10.
**Verification:** plugin file is `.client.ts`; `pnpm dev` loads with no GSAP console errors; ScrollTrigger usable from composables.

---

### U5. `app/plugins/lenis.client.ts` — Lenis init + RAF-drive ScrollTrigger + capability gates

**Goal:** Initialize Lenis smooth scroll on capable devices; drive ScrollTrigger from Lenis's RAF; fall back to native scroll otherwise.
**Requirements:** R6, R13, R14, KTD2, KTD4.
**Dependencies:** U1, U4 (ScrollTrigger registered first — order plugins so gsap registers before lenis, e.g. naming/numeric prefix or rely on alpha order `gsap` < `lenis`).
**Files:** `app/plugins/lenis.client.ts`.
**Approach:** `defineNuxtPlugin`. Compute gate: `matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(pointer: coarse)').matches`. If gated → **do not** instantiate Lenis (native scroll; ScrollTrigger uses default scroller). Else instantiate Lenis, hook `lenis.on('scroll', ScrollTrigger.update)`, drive both via `gsap.ticker.add` (or a `requestAnimationFrame` loop calling `lenis.raf(time)`), set `gsap.ticker.lagSmoothing(0)`. Clean up on `app:unmount`/`hook('app:beforeMount')` as appropriate. Provide the Lenis instance for `SmoothScroll`/composables if useful.
**Patterns to follow:** Lenis + GSAP ScrollTrigger integration (RAF bridge); Nuxt client plugin lifecycle.
**Test scenarios:**
- Covers R13. With `prefers-reduced-motion: reduce` emulated, Lenis is NOT instantiated and the page uses native scroll (verified in U10 browser test).
- With `(pointer: coarse)` (touch) emulated, Lenis is NOT instantiated.
- On a normal desktop pointer with motion allowed, Lenis is instantiated and scroll is smooth; ScrollTrigger updates on scroll.
**Verification:** plugin is `.client.ts`; reduced-motion/touch → native scroll; desktop → smooth scroll, no console errors.

---

### U6. `useReducedMotion` composable

**Goal:** Reactive boolean tracking `prefers-reduced-motion: reduce`.
**Requirements:** R7.
**Dependencies:** none.
**Files:** `app/composables/useReducedMotion.ts`, `tests/composables/useReducedMotion.test.ts`.
**Approach:** Return a `ref<boolean>`. SSR-safe default (`false` or based on no media access). On client, read `matchMedia('(prefers-reduced-motion: reduce)')`, set initial value, subscribe to `change`, unsubscribe on scope dispose (`onScopeDispose`/`tryOnScopeDispose`). Pure reactive utility — no GSAP/Three imports.
**Patterns to follow:** existing composable/test conventions (repo uses Vitest + happy-dom; see `tests/` and `vitest.config.ts`).
**Test scenarios:**
- Returns a ref defaulting to a safe value when `matchMedia` is unavailable (SSR-ish).
- Reflects `matches: true` when the mocked media query matches at mount.
- Updates reactively when a `change` event fires on the mocked media query list.
- Removes its listener on scope dispose (no leak).
**Verification:** unit tests pass under `pnpm test`; `pnpm typecheck` clean.

---

### U7. `useWebGLCapable` composable

**Goal:** Boolean signalling whether WebGL-heavy effects should run.
**Requirements:** R8.
**Dependencies:** U6 (reuses reduced-motion signal).
**Files:** `app/composables/useWebGLCapable.ts`, `tests/composables/useWebGLCapable.test.ts`.
**Approach:** Return a `ref<boolean>` (or computed). False when ANY of: reduced-motion preferred (reuse `useReducedMotion`); small viewport (e.g. `window.innerWidth < 768`); low `navigator.hardwareConcurrency` (e.g. `< 4`); low `navigator.deviceMemory` (e.g. `< 4`, when the API exists). SSR-safe default `false` (no WebGL until client confirms capability — avoids hydration/SSR WebGL). No `three` import here (keeps it out of SSR); this only *decides whether* later cycles mount Three scenes.
**Patterns to follow:** same test conventions as U6.
**Test scenarios:**
- Returns `false` during SSR/no-window.
- `false` when reduced-motion is preferred (other signals OK).
- `false` when viewport width below threshold.
- `false` when `hardwareConcurrency` below threshold.
- `false` when `deviceMemory` present and below threshold.
- `true` when all signals indicate a capable device.
- `deviceMemory` absent (undefined) does not by itself force `false`.
**Verification:** unit tests pass; `pnpm typecheck` clean; no `three` import in the SSR graph.

---

### U8. `useScrollReveal` composable

**Goal:** Progressive-enhancement scroll reveal — SSR-visible, hidden start state applied only in `onMounted`, ScrollTrigger drives the reveal.
**Requirements:** R9, R13, KTD3.
**Dependencies:** U4 (ScrollTrigger), U6 (reduced-motion bypass).
**Files:** `app/composables/useScrollReveal.ts`, `tests/composables/useScrollReveal.test.ts`.
**Approach:** Accept a target ref (element) + options (y offset, duration, stagger, start). SSR/no-JS: do nothing → element stays visible (KTD3, R13). In `onMounted`: if reduced-motion → leave visible, skip animation. Else set hidden start state (opacity 0 / translateY) via GSAP `.set`, then create a ScrollTrigger that animates to visible when the element scrolls into view. Dynamic-import gsap inside `onMounted` (or use the nuxt-provided gsap) so nothing pulls GSAP into SSR. Clean up the ScrollTrigger on scope dispose.
**Patterns to follow:** GSAP `from`/`set` + ScrollTrigger reveal pattern; SSR-safe composable guards.
**Test scenarios:**
- SSR/no-window: composable is a no-op and never touches the DOM (element remains visible).
- Reduced-motion: `onMounted` leaves the element visible, no hidden state applied, no ScrollTrigger created.
- Normal: `onMounted` applies a hidden start state and creates a ScrollTrigger (mock gsap/ScrollTrigger to assert calls).
- Scope dispose kills the created ScrollTrigger (no leak).
**Verification:** unit tests pass; element visible without JS; `pnpm typecheck` clean.

---

### U9. `GrainOverlay.vue` + `SmoothScroll.vue` components

**Goal:** A film-grain + vignette overlay element, and a SmoothScroll provider wrapper for the layout.
**Requirements:** R10 (component half), R12 (grain visible), KTD2.
**Dependencies:** U2/U3 (tokens/canvas), U5 (Lenis provider, consumed by SmoothScroll).
**Files:** `app/components/GrainOverlay.vue`, `app/components/SmoothScroll.vue`.
**Approach:**
- `GrainOverlay.vue`: a `position: fixed; inset:0; pointer-events:none; z-index` overlay rendering animated/static film grain (SVG `feTurbulence` filter or a tiled noise data-URI) plus a soft dark vignette. Purely presentational, SSR-safe (no JS-only deps); grain animation gated behind non-reduced-motion CSS. Scoped styles using tokens.
- `SmoothScroll.vue`: a thin wrapper component that renders a `<slot/>` and provides the smooth-scroll context (the Lenis instance is created in `lenis.client.ts`; this component is the layout-level mount point / `<ClientOnly>` boundary if needed). Keep it minimal — its job is to be the documented seam later cycles hook into.
**Patterns to follow:** existing component conventions (`SiteNav.vue`, `SiteFooter.vue`); scoped `<style>` using tokens; the project's "inline styles = Tailwind class soup" rule (avoid utility soup; use scoped CSS).
**Test scenarios:**
- `GrainOverlay` renders an overlay element that is non-interactive (`pointer-events:none`) and present in SSR markup (mount test).
- `GrainOverlay` grain animation is suppressed under reduced-motion (assert the reduced-motion CSS path / class).
- `SmoothScroll` renders its default slot content (so content is present with/without JS).
**Verification:** components mount in tests; grain visible in browser (U10); no console errors.

---

### U10. Wire `default.vue` + `nuxt.config.ts` (fonts, page transition); verify foundation green

**Goal:** Mount `GrainOverlay` + `SmoothScroll` in the default layout, add the page transition + mono font config, and verify the whole foundation builds green and behaves.
**Requirements:** R2 (font half), R10, R11, R12, R13, R14, KTD5, KTD6.
**Dependencies:** U2–U9.
**Files:** `app/layouts/default.vue`, `nuxt.config.ts`.
**Approach:**
- `nuxt.config.ts`: add a monospace family to `fonts.families` (KTD6) — e.g. `{ name: 'JetBrains Mono', weights: [500], styles: ['normal'] }`. Add `app.pageTransition: { name: 'page', mode: 'out-in' }` (KTD5). CSS for `.page-*` lives in `base.css` (U3). Keep existing css-array order (tokens → base → chrome → sections).
- `default.vue`: wrap the existing structure so `GrainOverlay` renders globally (fixed overlay above the canvas, below content) and `SmoothScroll` provides the motion context around `<main>`. Preserve skip-link, `SiteNav`, `<main id="main">`, `SiteFooter`. Use `<ClientOnly>` only where strictly needed (GrainOverlay should be SSR-safe; SmoothScroll wrapper renders slot in SSR so content stays present per R13).
**Patterns to follow:** existing `default.vue`; existing `nuxt.config.ts` `fonts`/`app` blocks.
**Test scenarios:**
- Covers R12. `pnpm generate` output for `/` and `/consulting` contains the full page content (nav, main content, footer) — no-JS markup intact (R13). Grep prerendered HTML.
- Covers R14. Prerendered HTML / server chunks do NOT contain `three`/`gsap` library code — motion libs are client-only chunks. Grep `.output` for absence in server bundle; presence in client bundle.
- Covers R11. `pnpm typecheck`, `pnpm lint`, `pnpm generate` all exit 0.
- Covers R12. Browser: body renders dark ink; grain + vignette visible on `/` and `/consulting`.
- Covers R13. Browser with reduced-motion emulation: Lenis not active (native scroll); page transition motion suppressed.
**Verification:** all three green commands pass; `pnpm dev` no console errors; browser checks (U10 scenarios) pass.

---

## System-Wide Impact

- **All pages** flip from light to dark canvas via KTD1 remap — every existing component inherits dark surfaces/text without per-component edits. Expect some imperfect contrast/spacing on not-yet-restyled sections; acceptable per "unstyled-but-present is fine."
- **Performance:** Lenis + GSAP add client JS but only on capable, motion-OK devices; Three is installed but not yet mounted. No SSR cost (KTD2).
- **Accessibility:** reduced-motion users get native scroll, no reveal animation, no transition motion (R13, KTD3/KTD4). No-JS users get full content (R13).
- **Later cycles (2–6):** consume the new semantic tokens (`--ink`, `--paper`, `--accent`, `--font-mono`, …), `useScrollReveal`, `useWebGLCapable`, and the `SmoothScroll` seam.

---

## Risks & Mitigations

- **R: Remapping `--color-*` produces unreadable contrast on some existing components.** Mitigation: choose remap targets so text tokens map to light values and surface tokens to dark values; verify in U10 browser pass. Acceptable bar is "present", not "polished."
- **R: GSAP/Three leak into SSR bundle.** Mitigation: `.client.ts` plugins + dynamic import in composables; U10 grep gate asserts absence in server output (KTD2/R14).
- **R: Lenis breaks scrolling on touch/reduced-motion.** Mitigation: capability gates in U5 (KTD4); U10 emulation tests.
- **R: `feTurbulence` grain is GPU-expensive.** Mitigation: prefer a static tiled-noise data-URI or low-frequency filter; animate only under non-reduced-motion; keep overlay opacity low.
- **R: Plugin order (lenis before gsap registers ScrollTrigger).** Mitigation: ensure gsap plugin runs first (alpha order `gsap` < `lenis`, or explicit ordering); U5 dependency note.

---

## Scope Boundaries

**In scope:** tokens, dark canvas, grain/vignette, motion plugins, three composables, GrainOverlay + SmoothScroll components, default-layout wiring, page transition, mono font, green build + behavior verification.

**Out of scope (this cycle):**
- Restyling `chrome.css` / `sections.css` or any section/component to the new dark design — cycles 2–6.
- Any actual Three.js scene/WebGL render — `useWebGLCapable` only *decides*; nothing mounts a canvas yet.
- Adopting `--font-mono` in any component.
- New copy, layout, or IA changes.

### Deferred to Follow-Up Work

- Migrating existing components off the remapped `--color-*` names onto the new semantic tokens (`--ink`/`--paper`/etc.) — happens naturally as cycles 2–6 restyle each surface.

---

## Sources & Research

- PRO-109 brief + acceptance criteria (ticket).
- Local audit: `--color-*` token consumption across `app/assets/css/` (chrome/sections heavily depend on old names → KTD1).
- Existing files reviewed: `app/assets/css/tokens.css`, `app/assets/css/base.css`, `nuxt.config.ts`, `app/layouts/default.vue`, `app/app.vue`, `package.json`, `02-design-system-motto.md`.
- Repo has **no** `.github/workflows`; "green CI" = local `pnpm typecheck && pnpm lint && pnpm generate` (per pipeline note).
- Test harness present: Vitest + happy-dom + `@vue/test-utils` (`vitest.config.ts`, `tests/`) — used for composable/component unit tests in U6–U9.
