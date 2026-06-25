---
title: "refactor: Retire the motion stack (Three.js/GSAP/Lenis/cursor) + CSS reveal utility"
status: active
date: 2026-06-25
type: refactor
ticket: PRO-174
---

# refactor: Retire the motion stack (Three.js/GSAP/Lenis/cursor) + CSS reveal utility

## Summary

Strip the heavy client-side motion machinery (Three.js, GSAP, Lenis, custom cursor) from the Nuxt site so the editorial redesign (Redesign v2) builds on a clean, lightweight, static-first base. Every current on-screen string must still render server-side, the site must build green under `pnpm build` / `nuxt generate`, and `grep -r "three\|gsap\|lenis" app/` must find no imports. Scroll reveal is re-expressed as a pure-CSS `[data-reveal]` utility using `animation-timeline: view()` with a transform fallback and a `prefers-reduced-motion` guard.

This is dependency-free foundation work and is the first item in the Redesign v2 epic (PRO-173). Nothing else depends on it; it unblocks subsequent redesign tickets.

---

## Problem Frame

The current site (PRO-109 through PRO-113) shipped a layered motion platform: a Three.js WebGL hero shader, GSAP-driven kinetic headline / stat counter / scroll reveals / parallax / mobile nav overlay, a Lenis smooth-scroll provider, and a GSAP-tracked custom cursor. The redesign drops this entire layer in favor of a static editorial aesthetic. Carrying the dependencies forward would bloat the bundle and complicate every subsequent redesign change.

The constraint that makes this more than a delete: **the served HTML must keep all copy and stay usable with JS disabled and under reduced motion.** Most of these components already SSR their final text as an enhancement contract, so removing the JS layer should not drop content — but two components the brief did not enumerate (`HeroSection.vue`, `SiteNav.vue`) also import motion-stack code and must be neutralized to satisfy the grep + build gates.

---

## Requirements

- **R1** — Remove deps `three`, `@types/three`, `gsap`, `lenis` from `package.json`.
- **R2** — Delete motion-only components: `HeroScene.vue`, `CustomCursor.vue`, `MagneticButton.vue`, `KineticHeading.vue`, `Marquee.vue`, `StatCounter.vue`.
- **R3** — Delete client plugins `gsap.client.ts`, `lenis.client.ts`.
- **R4** — Remove composable `useWebGLCapable.ts`; rework `useScrollReveal.ts` to a no-op (or CSS-driven) enhancement with no GSAP import.
- **R5** — Remove `SmoothScroll.vue`; render the layout slot directly.
- **R6** — Update `default.vue`, `index.vue`, `consulting.vue` (+ `HeroSection.vue`, `SiteNav.vue` — required by R8/R9) to static equivalents.
- **R7** — Remove all `gsap`/`lenis` references from `nuxt.config.ts` (verify: there are none today, but confirm).
- **R8** — Add `[data-reveal]` keyframes + `animation-timeline: view()` + transform fallback + `prefers-reduced-motion` guard to `app/assets/css/base.css`.
- **R9 (acceptance)** — `pnpm build` / `nuxt generate` green; `grep -r "three\|gsap\|lenis" app/` returns no imports; Home + Consulting render all copy in served HTML and are usable with JS disabled + reduced motion.

---

## Key Technical Decisions

**KTD1 — `HeroSection.vue` and `SiteNav.vue` are in scope even though the brief omitted them.** The brief's component list misses two files that import motion-stack code: `HeroSection.vue` imports `useWebGLCapable` and renders `<HeroScene>` (which dynamically imports `three`); `SiteNav.vue` reads `$lenis` from the deleted plugin and dynamically imports `gsap` for its mobile overlay stagger. Leaving either as-is fails both acceptance gates (grep finds `three`/`gsap`/`lenis`; build fails on the missing `useWebGLCapable` import and the deleted `HeroScene` component). Both are reworked to static equivalents. This is the load-bearing deviation from the brief — recorded so the reviewer expects the extra diff.

**KTD2 — Hero background becomes the existing CSS gradient fallback, permanently.** `HeroSection.vue` already ships a `.hero-bg-fallback` CSS gradient as its SSR / no-JS / reduced-motion render. Removing the WebGL path collapses the `<ClientOnly>` + `useWebGLCapable` branch to just that static fallback `<div>`. No new visual design is invented here (that belongs to later redesign tickets); we keep the gradient that already exists so the hero still has a backdrop.

**KTD3 — Kinetic headline → static `<h1>`; preserve the exact accessible name and existing `.hero h1` styling.** `KineticHeading` SSR-rendered `prefix + words[0]` (home: "AI EXPERIMENTS") or the static `text` (consulting). Replace each usage with a plain `<h1>` carrying the same visible text and `aria-label`, slotted into `HeroSection`'s `#headline` exactly as before so the global `.hero h1` rule in `sections.css` keeps styling it. The cycling word animation is dropped (acceptable — brief allows "static or CSS-cycled"; static is the lighter choice and avoids re-introducing motion).

**KTD4 — `MagneticButton` → plain `<NuxtLink>` / `<a>` with a shared `.btn` class.** `MagneticButton` was polymorphic (NuxtLink for `to`, `<a>` for `href`) with a CSS hover-fill sweep plus JS magnetic translate. Replace with plain anchors/links. Preserve the hover-fill + arrow visuals by introducing a static `.btn` / `.btn--filled` / `.btn--ghost` rule in `sections.css` (lifted from `MagneticButton`'s scoped `<style>`, minus the JS-driven `transform`). Drop the magnetic pointer-tracking entirely.

**KTD5 — `Marquee` → a static readable list; `StatCounter` → a static figure.** Both already SSR their final state. Replace `<Marquee :items>` with a plain static strip (no infinite scroll), and `<StatCounter :value="95" suffix="%">` with static markup showing "95%" + the existing caption/citation. Trim the now-dead `.marquee*` and `.stat-counter*` animation CSS in `sections.css`, keeping only what the static markup needs. The arc SVG (a GSAP-swept ring) is dropped — the stat is just a number per the brief.

**KTD6 — `useScrollReveal` becomes a no-op; reveal moves to CSS `[data-reveal]`.** Rework `useScrollReveal.ts` to an inert no-op (keeps the import sites in `index.vue` / `ExperimentCard.vue` compiling without churn, and keeps the exported signature stable) OR delete it and remove call sites. **Decision: reduce to a no-op** — it has the smallest blast radius (no edits to call sites beyond removing the now-pointless refs is optional), and the CSS `[data-reveal]` utility in `base.css` is what actually drives reveals going forward via `animation-timeline: view()`. Elements opt in by adding `data-reveal`; nothing breaks if they don't.

**KTD7 — `ExperimentCard.vue` loses its GSAP parallax + reveal; keeps CSS hover.** The card dynamically imports `gsap` for an image parallax and calls `useScrollReveal`. Remove the GSAP parallax block and the `useScrollReveal` call (or let the no-op stand). The CSS hover image-scale stays. Add `data-reveal` to the card root if a reveal is desired — optional, non-blocking.

**KTD8 — Delete obsolete test specs rather than rewrite them.** `tests/` contains specs for every removed unit (`KineticHeading`, `MagneticButton`, `Marquee`, `StatCounter`, `SmoothScroll`, `useWebGLCapable`, `useScrollReveal`). Delete the specs for deleted code. `SiteNav.spec.ts` and `ExperimentCard.spec.ts` test the static `links` logic / SSR render (not GSAP), so they survive — verify they still pass after the rework.

---

## High-Level Technical Design

Dependency layers being removed and what replaces them:

```
BEFORE                                   AFTER
──────                                   ─────
three  ──► HeroScene ──► HeroSection     HeroSection ──► .hero-bg-fallback (CSS gradient)
gsap   ──► KineticHeading                <h1> static text
       ──► StatCounter                   static figure markup (95%)
       ──► CustomCursor                  (removed)
       ──► MagneticButton                <NuxtLink>/<a>.btn
       ──► useScrollReveal ──► cards      CSS [data-reveal] + animation-timeline: view()
       ──► ExperimentCard parallax        CSS hover only
       ──► SiteNav overlay stagger        instant CSS toggle
lenis  ──► lenis.client plugin            (removed)
       ──► SmoothScroll provider          layout renders slot directly
       ──► SiteNav $lenis stop/start      (removed; body-class scroll-lock stays)
```

Reveal mechanism (CSS, in `base.css`):

```
[data-reveal] {
  /* default = visible (no-JS / unsupported / reduced-motion safe) */
}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-reveal] {
      animation: reveal-in linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 40%;  /* directional, tune in impl */
    }
    @keyframes reveal-in { from { opacity:0; transform: translateY(24px) } to { opacity:1; transform:none } }
  }
}
```

The `@supports` + `prefers-reduced-motion: no-preference` double guard means: unsupported browsers and reduced-motion users get the fully-visible default state with no hidden start — satisfying R9's no-JS / reduced-motion clause structurally.

---

## Implementation Units

### U1. Remove dependencies and delete motion-only files

**Goal:** Drop the four packages and delete every file that exists only to serve motion.
**Requirements:** R1, R2, R3, R4 (delete `useWebGLCapable`), R5.
**Dependencies:** none.
**Files:**
- `package.json` (remove `three`, `@types/three`, `gsap`, `lenis`)
- delete `app/components/HeroScene.vue`, `app/components/CustomCursor.vue`, `app/components/MagneticButton.vue`, `app/components/KineticHeading.vue`, `app/components/Marquee.vue`, `app/components/StatCounter.vue`, `app/components/SmoothScroll.vue`
- delete `app/plugins/gsap.client.ts`, `app/plugins/lenis.client.ts`
- delete `app/composables/useWebGLCapable.ts`
- delete `tests/KineticHeading.spec.ts`, `tests/MagneticButton.spec.ts`, `tests/Marquee.spec.ts`, `tests/StatCounter.spec.ts`, `tests/SmoothScroll.spec.ts`, `tests/useWebGLCapable.spec.ts`, `tests/useScrollReveal.spec.ts`
**Approach:** Pure deletion + `package.json` edit. Run `pnpm install` after to update the lockfile. The app will not build yet (call sites still reference deleted components) — that is fixed in U3–U6. Do this first so the build errors point precisely at the remaining call sites.
**Patterns to follow:** n/a (deletion).
**Test scenarios:** Test expectation: none — file/dependency removal; correctness proven by the green build in U7 and the grep in U8.
**Verification:** `git status` shows the files deleted; `pnpm install` succeeds and the lockfile no longer lists three/gsap/lenis.

### U2. Add the CSS `[data-reveal]` reveal utility to base.css

**Goal:** Provide the pure-CSS scroll-reveal that replaces the GSAP one.
**Requirements:** R8.
**Dependencies:** none (can land before or after U1).
**Files:** `app/assets/css/base.css`
**Approach:** Append a `[data-reveal]` block per the High-Level Technical Design: default state fully visible; inside `@supports (animation-timeline: view())` AND `@media (prefers-reduced-motion: no-preference)`, attach a `reveal-in` keyframe animation driven by `animation-timeline: view()` with an `animation-range`. Keyframe: opacity 0 → 1, `translateY(24px)` → none. Mirror the existing reduced-motion guard style already in `base.css` (the file already has two `prefers-reduced-motion: reduce` blocks for scroll-behavior and page transitions). Use the modern-web-guidance skill to confirm current `animation-timeline` / `animation-range` syntax before writing.
**Patterns to follow:** existing `@media (prefers-reduced-motion: reduce)` blocks in `base.css` (lines ~46, ~61); `@keyframes marquee-scroll` in `sections.css` for keyframe placement convention.
**Test scenarios:** Test expectation: none — pure CSS, no behavioral unit. Verified visually in browser tests (U9) under normal + reduced motion.
**Verification:** Build includes the new CSS; in a supporting browser, an element with `data-reveal` animates on scroll; with reduced motion or JS off, the element is fully visible from the start (no hidden state).

### U3. Rework `HeroSection.vue` to the static CSS gradient hero

**Goal:** Remove the WebGL/`useWebGLCapable` path; keep the existing `.hero-bg-fallback` gradient as the permanent background. Preserve the slot API.
**Requirements:** R6, R9 (this is what removes `three`/`useWebGLCapable` from the hero).
**Dependencies:** U1 (HeroScene + useWebGLCapable deleted).
**Files:** `app/components/HeroSection.vue`
**Approach:** Delete the `useWebGLCapable` import, the `webglCapable`/`sceneFailed` refs, and the `<ClientOnly>`/`<HeroScene>` branch. Replace `.hero-bg` contents with a single `<div class="hero-bg-fallback" />`. Keep all slots (`#eyebrow`, `#headline`, `#sub`, `#ctas`) and the `downArrow`/`downArrowHref` props unchanged — `index.vue` and `consulting.vue` depend on the contract. Update the component's top comment to drop the WebGL description.
**Patterns to follow:** the existing `#fallback` template inside the current `<ClientOnly>` already renders `<div class="hero-bg-fallback" />` — promote it to the only background.
**Test scenarios:**
- Renders all four slots' content in SSR output (eyebrow, headline, sub, ctas).
- Renders `.hero-bg-fallback` and no `<canvas>` / HeroScene element.
- `downArrow=false` omits the down-arrow anchor; default renders it with `downArrowHref`.
**Verification:** No import of `useWebGLCapable`/`three`; hero renders with the gradient backdrop in served HTML.

### U4. Replace `KineticHeading` usages with static `<h1>` headlines

**Goal:** Home and Consulting headlines render as plain static `<h1>` with the same text, accessible name, and styling.
**Requirements:** R6, R9.
**Dependencies:** U1 (KineticHeading deleted), U3 (HeroSection slot intact).
**Files:** `app/pages/index.vue`, `app/pages/consulting.vue`
**Approach:** In `index.vue`, replace `<KineticHeading :words="['EXPERIMENTS','CONSULTING','TRAINING']" prefix="AI " />` with `<h1 aria-label="AI EXPERIMENTS">AI EXPERIMENTS</h1>` (matching the prior SSR text + aria-label exactly). In `consulting.vue`, replace `<KineticHeading text="Your recurring work, done by a system." />` with `<h1>Your recurring work, done by a system.</h1>`. Keep them inside the `#headline` slot so `.hero h1` styles them. (The visible text matches what `KineticHeading` SSR-rendered, so no copy changes server-side.)
**Patterns to follow:** the `<h1>` markup `KineticHeading.vue` itself rendered (`<h1 :aria-label>` with a single visible span).
**Test scenarios:**
- Covers R9. Home served HTML contains `AI EXPERIMENTS` in an `<h1>`.
- Covers R9. Consulting served HTML contains `Your recurring work, done by a system.` in an `<h1>`.
**Verification:** Both headlines present in `view-source` with no JS; no `KineticHeading` reference remains.

### U5. Replace `MagneticButton` usages with static `.btn` links and add static button CSS

**Goal:** All hero CTAs render as plain `<NuxtLink>`/`<a>` with the hover-fill + arrow visuals preserved via static CSS.
**Requirements:** R6, R9.
**Dependencies:** U1 (MagneticButton deleted).
**Files:** `app/pages/index.vue`, `app/pages/consulting.vue`, `app/assets/css/sections.css`
**Approach:** Add `.btn`, `.btn--filled`, `.btn--ghost`, `.btn__arrow` rules to `sections.css`, lifted from `MagneticButton.vue`'s scoped `<style>` (hover-fill `::before` sweep, arrow nudge, focus-visible ring, ≥44px hit area) minus the JS `transform` line. Replace each `<MagneticButton ...>` with the polymorphic-equivalent element: `to` → `<NuxtLink class="btn btn--ghost" to="...">`, `href` → `<a class="btn btn--filled" href="...">`, plus an inner `<span class="btn__arrow" aria-hidden="true">→</span>` when `arrow` was set. Map the four usages (home: `#work` anchor filled+arrow, `/consulting` route ghost; consulting: `mailto:` filled+arrow, `#how` anchor ghost).
**Patterns to follow:** `MagneticButton.vue` scoped `<style>` (the source of the static rules); existing `sections.css` button/atom conventions.
**Test scenarios:**
- Covers R9. Home hero served HTML contains "See the work" and "Consulting" CTA links with correct `href`/`to`.
- Covers R9. Consulting hero served HTML contains "Start a conversation" (mailto) and "See how it works" (`#how`) CTAs.
- CTAs are real `<a>`/`<NuxtLink>` elements (clickable with JS off).
**Verification:** No `MagneticButton` reference; CTAs styled and clickable; focus ring visible.

### U6. Statify `consulting.vue` Marquee + StatCounter, rework SiteNav, neutralize useScrollReveal/ExperimentCard, render layout slot directly

**Goal:** Remove the last GSAP/Lenis touch points so the grep is clean and the build is green.
**Requirements:** R4 (rework `useScrollReveal`), R5, R6, R9.
**Dependencies:** U1.
**Files:**
- `app/pages/consulting.vue` (remove `<Marquee>` + `marqueeItems`, replace `<StatCounter>` with static markup)
- `app/assets/css/sections.css` (trim dead `.marquee*` / `.stat-counter*` animation CSS; keep static-figure styles needed by the new markup)
- `app/components/SiteNav.vue` (remove `$lenis` usage + the dynamic `gsap` overlay stagger → instant CSS toggle; keep scroll-lock via body class, focus trap, Esc-to-close)
- `app/composables/useScrollReveal.ts` (reduce to a no-op that keeps the exported signature; remove the `gsap`/`ScrollTrigger` dynamic imports)
- `app/components/ExperimentCard.vue` (remove the `gsap` parallax block; drop or keep the now-no-op `useScrollReveal` call; keep CSS hover; optionally add `data-reveal`)
- `app/layouts/default.vue` (remove `<SmoothScroll>` and `<CustomCursor>`; render `<SiteNav>/<main>/<SiteFooter>` directly; keep skip-link + `<GrainOverlay>`)
**Approach:**
- *consulting.vue:* delete the `marqueeItems` array + `<Marquee>` element. Replace the `<StatCounter :value="95" suffix="%" label="...">…</StatCounter>` with static markup rendering "95%" + the existing label, note paragraph, and `<cite>` citation. Use a static figure (`.stat-figure` or reuse trimmed `.stat-counter` classes) — no SVG arc, no count-up.
- *SiteNav.vue:* delete `const { $lenis } = useNuxtApp()`, the `$lenis?.stop()/start()` calls, and the `await import('gsap')` overlay-stagger block in `openMenu`; the overlay still opens/closes via the `.is-open` CSS class (instant). Keep `lockScroll`/`unlockScroll` body-class logic (drop only the Lenis lines), the focus trap, Esc handling, and focus restoration. Update the top comment.
- *useScrollReveal.ts:* replace the body with a no-op (accept the same args, return nothing, no imports). Keep the `ScrollRevealOptions` export so type imports don't break.
- *ExperimentCard.vue:* remove the `onMounted` GSAP parallax + its imports and `cleanup`/`onScopeDispose`; keep the `useScrollReveal(cardEl)` call only if it's now a harmless no-op, else remove it and the import. Keep the CSS hover scale.
- *default.vue:* remove `<CustomCursor />` and the `<SmoothScroll>` wrapper, rendering `<SiteNav/>`, `<main id="main" tabindex="-1"><slot/></main>`, `<SiteFooter/>` directly under `.layout-root`. Keep the skip-link and `<GrainOverlay/>`.
**Patterns to follow:** the static SSR markup `StatCounter`/`Marquee` already produced (final number + items as real text); the body-class scroll-lock already present in `SiteNav`.
**Test scenarios:**
- Covers R9. Consulting served HTML contains `95%`, the MIT citation, and all marquee strings ("Recurring reports", "Team training", etc.) as static text.
- `SiteNav` overlay opens/closes and traps focus with no GSAP import (existing `SiteNav.spec.ts` `links` assertions still pass).
- `useScrollReveal` is importable and inert (no throw when called; no `gsap` import).
- Layout renders `<SiteNav>/<main>/<SiteFooter>` with no `SmoothScroll`/`CustomCursor` elements; skip-link + GrainOverlay present.
- `ExperimentCard` SSR renders the complete static card (existing `ExperimentCard.spec.ts` passes).
**Verification:** `grep -rn "gsap\|lenis\|three" app/` returns nothing (no imports, no `$lenis`); all copy present in served HTML.

### U7. Confirm nuxt.config.ts is clean and build green

**Goal:** Verify the config carries no motion refs and the production build/generate passes.
**Requirements:** R7, R9.
**Dependencies:** U1–U6.
**Files:** `nuxt.config.ts` (verify only — current read shows no gsap/lenis/three refs; the `pageTransition` + CSS list stay)
**Approach:** Confirm no plugin auto-registration or config references the deleted plugins (Nuxt auto-discovers `app/plugins/`, so deleting the files is sufficient — no config edit expected). Run `pnpm install && pnpm build` (and `pnpm generate`). Fix any residual compile errors from missed call sites. There is no CI — the green build is the real gate.
**Patterns to follow:** n/a.
**Test scenarios:** Covers R9. `pnpm build` exits 0; `pnpm generate` emits prerendered `/` and `/consulting` HTML under `.output/public`.
**Verification:** Build + generate succeed; `pnpm test` (vitest) green after the spec deletions; `pnpm lint` clean.

### U8. Acceptance grep + served-HTML audit

**Goal:** Prove the two mechanical acceptance gates.
**Requirements:** R9.
**Dependencies:** U7.
**Files:** none (verification unit).
**Approach:** Run `grep -rn "three\|gsap\|lenis" app/` and confirm zero import/usage hits (comments mentioning the words in prose are acceptable only if they carry no import — prefer scrubbing stale comments too). Inspect the generated `/` and `/consulting` HTML in `.output/public` (or `view-source`) and confirm every current string is present: home headline "AI EXPERIMENTS", experiment titles, About copy; consulting headline, brief copy, marquee strings, "95%" + citation, offerings, pricing, CTA copy.
**Patterns to follow:** n/a.
**Test scenarios:** Covers R9. grep is empty; both pages' full copy present in static HTML.
**Verification:** Documented grep output + HTML copy check, recorded in the PR / Plane comment.

### U9. Browser verification — no-JS and reduced-motion

**Goal:** Confirm both pages are usable with JS disabled and under reduced motion.
**Requirements:** R9.
**Dependencies:** U7.
**Files:** none (verification unit).
**Approach:** Serve the built site (`pnpm preview` or a static server over `.output/public`). With JS disabled: both pages render all copy, CTAs are clickable links, nav links work. With `prefers-reduced-motion: reduce`: `[data-reveal]` elements are fully visible from the start (no hidden state), page transition is instant, no motion plays. With JS + normal motion: `[data-reveal]` reveals on scroll in a supporting browser.
**Patterns to follow:** prior PRO-114 QA evidence approach (screenshots, reduced-motion, no-JS) referenced in repo history.
**Test scenarios:**
- No-JS home + consulting: all copy visible, links functional.
- Reduced-motion: no hidden reveal state, instant transitions.
- Normal: reveal animation plays on scroll where supported.
**Verification:** Browser-test run passes on home + consulting for both no-JS and reduced-motion.

---

## Scope Boundaries

**In scope:** removing the four deps, deleting the seven motion components + two plugins + `useWebGLCapable`, reworking `useScrollReveal` to a no-op, reworking `HeroSection`/`SiteNav`, updating both pages + layout to static, adding the `[data-reveal]` CSS utility, trimming now-dead marquee/stat-counter CSS, deleting obsolete test specs.

**Out of scope / deferred to follow-up:**
- New visual design for the hero background, headlines, or buttons — later Redesign v2 tickets own the new editorial look. This ticket keeps existing styling (the gradient fallback, `.hero h1`, lifted `.btn` rules) so the site stays presentable, not redesigned.
- Adding `data-reveal` to specific elements as a designed reveal choreography — the utility is added; where it's applied is a redesign decision. A minimal/optional application is fine here.
- Removing `GrainOverlay` — the brief explicitly says keep it for now.
- Any change to `tokens.css`, `chrome.css` beyond what the button/figure rework strictly needs.

---

## Risks & Dependencies

- **Risk: missed call site breaks the build.** Mitigated by U1-first ordering (delete, then let build errors point at every remaining reference) and the explicit `HeroSection`/`SiteNav` call-outs (KTD1). Verified by U7.
- **Risk: `animation-timeline: view()` browser support.** It is not universal. Mitigated structurally by the `@supports` guard (KTD6/U2): unsupported browsers fall back to the fully-visible default — content is never hidden. No JS fallback is needed because the no-animation state IS the readable state.
- **Risk: `SiteNav` overlay regression.** Removing the GSAP stagger and `$lenis` could affect the mobile menu. Mitigated by keeping the body-class scroll-lock, focus trap, and `.is-open` CSS toggle; the stagger was cosmetic. Verified by `SiteNav.spec.ts` + U9.
- **Dependency:** none upstream — this is the first Redesign v2 unit and unblocks the rest.

---

## Sources & Research

- Feature brief: Plane PRO-174 (`description_stripped`), under epic PRO-173.
- Codebase: read of `default.vue`, `index.vue`, `consulting.vue`, `HeroSection.vue`, `SiteNav.vue`, `ExperimentCard.vue`, `KineticHeading.vue`, `MagneticButton.vue`, `Marquee.vue`, `StatCounter.vue`, `SmoothScroll.vue`, `useScrollReveal.ts`, `useReducedMotion.ts`, `base.css`, `sections.css` (PRO-109..114 lineage).
- `nuxt.config.ts` confirmed to carry no gsap/lenis/three references today (R7 is a verify-only requirement).
- Modern CSS reveal (`animation-timeline: view()`, `animation-range`, `@supports`, `prefers-reduced-motion`) — confirm exact syntax via the `modern-web-guidance` skill during U2.
