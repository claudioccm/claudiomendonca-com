---
title: "feat: Hero — WebGL + kinetic headline + magnetic CTA (PRO-111)"
status: active
date: 2026-06-13
type: feat
ticket: PRO-111
origin: Plane PRO-111 (Redesign 3/6 — Hero)
---

# feat: Hero — WebGL + kinetic headline + magnetic CTA (PRO-111)

## Summary

Redesign 3/6 builds the hero centerpiece on top of the merged foundation (PRO-109) and chrome (PRO-110). Four components: a capability-gated Three.js shader plane behind the hero, a slot-preserving `HeroSection` that layers WebGL or a CSS-gradient fallback behind its content, a GSAP-SplitText kinetic headline that folds in the retired typewriter's rotating-word cycle, and a magnetic hover-fill pill CTA. The typewriter components are retired. `index.vue` and `consulting.vue` are touched only to swap the headline and CTA usages — no broader recompose.

The guiding constraints: **SSR-real copy** (headline/sub/CTA text in view-source), **capability gating** (WebGL only when `useWebGLCapable()`, else CSS fallback), and **reduced-motion correctness** (no WebGL, static headline, no magnetic motion). Three.js and GSAP must never enter the SSR/prerender graph.

---

## Problem Frame

The current hero uses `TypewriterHeadline.vue` (a per-keystroke JS typewriter with a `?tune` dev panel via `TypewriterTuner.vue`) and plain `.btn`/`.btn-filled`/`.btn-ghost` pill links. The redesign direction (dark, motion-forward, technically ambitious) wants the hero to feel alive: an animated WebGL background, a headline that reveals kinetically, and CTAs that respond to the pointer. The work must keep the existing `HeroSection` slot API intact (consumed by both `index.vue` and `consulting.vue`) and must degrade cleanly: real text for crawlers/no-JS, CSS gradient when WebGL is not capable, and full stillness under `prefers-reduced-motion`.

---

## Requirements

- **R1 — HeroScene WebGL.** `app/components/HeroScene.client.vue` renders a fullscreen Three.js shader plane (animated gradient/flow, accent `#6980ff` glow). Lazy + client-only, capped DPR, paused when off-screen or tab hidden. Mounts only when `useWebGLCapable()` is true.
- **R2 — HeroSection layering.** `app/components/HeroSection.vue` keeps the existing slot API (`#eyebrow`/`#headline`/`#sub`/`#ctas` + `downArrow`/`downArrowHref` props). It layers a WebGL background (or an animated CSS gradient fallback) behind the slotted content, without disturbing the slot contract.
- **R3 — KineticHeading.** `app/components/KineticHeading.vue` does a GSAP SplitText reveal. Supports the home headline's rotating words (`EXPERIMENTS` / `CONSULTING` / `TRAINING` after an `AI ` prefix) and a static consulting headline. Reduced-motion = static headline, no split animation.
- **R4 — MagneticButton.** `app/components/MagneticButton.vue` is a magnetic + hover-fill pill CTA replacing `.btn`/`.btn-filled`/`.btn-ghost` usage in the hero. Keyboard- and focus-accessible, tap target ≥44px, renders as `<a>`/`NuxtLink`/`<button>` as appropriate.
- **R5 — Retire Typewriter.** Remove `TypewriterHeadline.vue` and `TypewriterTuner.vue`. Repoint or replace `tests/TypewriterHeadline.spec.ts` to assert `KineticHeading` reduced-motion gating.
- **R6 — Page swaps (scoped).** Update `app/pages/index.vue` and `app/pages/consulting.vue` ONLY to swap Typewriter→KineticHeading and `.btn`→MagneticButton in the hero. The fuller home/consulting recompose is later cycles — do not over-reach.
- **R7 — SSR / no-JS.** Hero renders real SSR copy: headline, sub, and CTA text present in view-source with JS off.
- **R8 — Reduced motion.** Under `prefers-reduced-motion: reduce`: no WebGL, static headline (no split animation), no magnetic motion.
- **R9 — Green gates.** `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm generate` all pass. No console errors at 375/768/1280/1440.

---

## Key Technical Decisions

### KTD1 — Three.js and GSAP stay out of the SSR graph

`HeroScene.client.vue` carries the `.client` suffix so Nuxt never imports it during SSR/prerender. The component is additionally wrapped in `<ClientOnly>` at its mount site inside `HeroSection`, and `three` is loaded via dynamic `import('three')` inside `onMounted` (mirroring `useScrollReveal`'s dynamic GSAP import — KTD2 of PRO-109). GSAP is already provided client-only via `app/plugins/gsap.client.ts` (`$gsap`, `$ScrollTrigger`, `$SplitText`); `KineticHeading` and `MagneticButton` use `useNuxtApp().$gsap` / `$SplitText` rather than importing `gsap` at module scope. This keeps `nuxt generate` emitting real prerendered markup with no heavy-lib import in the server bundle.

### KTD2 — Capability gating is composable-driven, render-time

`HeroSection` calls `useWebGLCapable()` (already returns `false` on SSR, reduced-motion, small viewport `<768px`, low cores, low memory) and renders `<ClientOnly><HeroScene v-if="webglCapable" /></ClientOnly>`. When false, an animated CSS gradient fallback element renders in its place (the CSS animation is disabled under reduced-motion via the existing `@media (prefers-reduced-motion: reduce)` convention in the stylesheets). Because `useWebGLCapable()` already folds in `useReducedMotion()`, reduced-motion users get the static fallback automatically (R8).

### KTD3 — SSR-real copy via slotted text, animation enhances in place

The headline text, sub paragraph, and CTA labels are authored as real DOM text in the page templates and slotted into `HeroSection`. `KineticHeading` renders its text content directly in the template (SSR-visible) and only *enhances* it with SplitText in `onMounted` — the SplitText reveal animates existing characters, it does not inject the text. This satisfies R7 (view-source has the copy) and R8 (reduced-motion bails before splitting, leaving the static text). The rotating-word cycle starts from the SSR-rendered first word, exactly as the retired typewriter did.

### KTD4 — KineticHeading owns both home and consulting shapes via props

A single `mode` distinction: `words` prop (array) + `prefix` prop drives the home rotating headline; passing a default slot or a single static string drives the consulting headline. Reduced-motion and SSR both render the static first phrase. This keeps one component for both pages (R3) rather than two near-duplicates. The `?tune` dev panel and the 5 numeric `TyperConfig` knobs are dropped — kinetic timing is GSAP-driven and not live-tunable (decision recorded here; `app/types/typer.ts` is removed with the typewriter).

### KTD5 — MagneticButton is a polymorphic element, motion gated

`MagneticButton` renders `<a>` (external/anchor href), `NuxtLink` (internal `to`), or `<button>` (no href/to) based on props, so it is a drop-in for the three current hero CTA shapes (`href="#work"`, `to="/consulting"`, `mailto:` href, `href="#how"`). The pill geometry and hover-fill come from scoped styles reusing existing tokens (`--radius-buttons: 9999px`, accent on hover). The magnetic translate effect runs only on fine-pointer + motion-allowed (reuse `useReducedMotion()` + a pointer check, mirroring `CustomCursor`'s gating from PRO-110); under reduced-motion or coarse pointer the button is a normal static pill. Min 44×44 hit area enforced in CSS.

---

## High-Level Technical Design

Component / data-flow shape of the redesigned hero:

```mermaid
flowchart TD
  Page["index.vue / consulting.vue<br/>(real SSR text in slots)"] -->|#headline #sub #ctas| Hero["HeroSection.vue<br/>(slot API preserved)"]
  Hero -->|useWebGLCapable()| Gate{capable?}
  Gate -->|true| Client["&lt;ClientOnly&gt;"]
  Client --> Scene["HeroScene.client.vue<br/>dynamic import('three')<br/>capped DPR · pause off-screen/hidden"]
  Gate -->|false| Fallback["CSS animated gradient<br/>(still under reduced-motion)"]
  Hero -->|#headline slot| Kinetic["KineticHeading.vue<br/>SSR text + GSAP SplitText reveal<br/>rotating words OR static"]
  Hero -->|#ctas slot| Magnetic["MagneticButton.vue ×N<br/>a / NuxtLink / button<br/>magnetic+fill, gated"]
  Kinetic -.reduced-motion.-> Static1["static text, no split"]
  Magnetic -.reduced-motion/coarse.-> Static2["static pill, no magnet"]
```

Directional only — the prose and per-unit sections are authoritative.

---

## Implementation Units

### U1. MagneticButton.vue — polymorphic magnetic pill CTA

**Goal:** A reusable pill CTA that replaces `.btn`/`.btn-filled`/`.btn-ghost` in the hero, with magnetic + hover-fill motion that is keyboard/focus accessible and ≥44px, gated off under reduced-motion / coarse pointer.

**Requirements:** R4, R8.

**Dependencies:** none (foundation composables already exist).

**Files:**
- `app/components/MagneticButton.vue` (create)
- `tests/MagneticButton.spec.ts` (create)

**Approach:**
- Props: `variant` (`'filled' | 'ghost'`, default `'filled'`), `href?`, `to?`, plus pass-through `aria-label`. Render `NuxtLink` when `to` is set, `<a>` when `href` is set, else `<button>`. Default slot is the label; optional trailing arrow (mirror current `.btn-arrow`).
- Scoped styles: `display: inline-flex`, `min-height: 44px`, `min-width: 44px`, `border-radius: var(--radius-buttons)`, padding matching current `.btn`. Filled = accent-or-paper fill; ghost = transparent with hairline border. Hover-fill = a pseudo-element or background transition that sweeps the fill in. Visible `:focus-visible` outline.
- Magnetic effect: on `pointermove` within the element bounds, translate the button (and label) a capped fraction toward the pointer; reset on `pointerleave`. Run only when `!reduced.value` and `matchMedia('(pointer: fine)').matches` (mirror `CustomCursor` gating). Use direct DOM transform writes in a rAF-friendly handler; clean up listeners on unmount.
- SSR-safe: the element and its text render server-side; motion wiring lives in `onMounted`, torn down in `onBeforeUnmount`.

**Patterns to follow:** `app/components/CustomCursor.vue` (pointer/reduced-motion gating, listener cleanup), existing `.btn` rules in `app/assets/css/sections.css` (geometry/tokens), `useReducedMotion()`.

**Test scenarios** (`tests/MagneticButton.spec.ts`, harness-style to avoid Nuxt auto-import dependency, mirroring `TypewriterHeadline.spec.ts`):
- Renders an `<a>` with the given `href` and the slot label as visible text (SSR copy present). Covers R7.
- Renders a `NuxtLink`/`router-link` stub when `to` is passed (assert the `to` prop / element).
- Renders a `<button>` when neither `href` nor `to` is passed.
- Reduced-motion: when `matchMedia('reduce')` matches, no transform is written on simulated pointermove (magnetic gating off). Covers R8.
- Non-reduced + fine pointer: a pointermove within bounds writes a non-empty transform; pointerleave resets it.
- Hit area: computed `min-height`/`min-width` ≥ 44px (assert the style rule is present).

**Verification:** Component renders all three element shapes; magnetic translate fires only when motion is allowed; focus ring visible on keyboard focus; tests green.

---

### U2. KineticHeading.vue — SplitText reveal + rotating words, retire Typewriter

**Goal:** A headline component that renders SSR-real text and enhances it with a GSAP SplitText reveal; supports the home rotating-word cycle (`AI ` + EXPERIMENTS/CONSULTING/TRAINING) and a static consulting headline; static under reduced-motion. Retire `TypewriterHeadline.vue`, `TypewriterTuner.vue`, and `app/types/typer.ts`.

**Requirements:** R3, R5, R7, R8.

**Dependencies:** none.

**Files:**
- `app/components/KineticHeading.vue` (create)
- `app/components/TypewriterHeadline.vue` (delete)
- `app/components/TypewriterTuner.vue` (delete)
- `app/types/typer.ts` (delete)
- `tests/KineticHeading.spec.ts` (create — replaces `tests/TypewriterHeadline.spec.ts`)
- `tests/TypewriterHeadline.spec.ts` (delete)

**Approach:**
- Props: `words?: string[]` (default `['EXPERIMENTS','CONSULTING','TRAINING']`), `prefix?: string` (default `'AI '`), and support for a static headline either via a `static` default slot / `text` prop or by passing a single-element `words` array. Render the `<h1>` with a stable `aria-label` and the visible first phrase (`prefix + words[0]`) as real text — SSR-visible (R7).
- Enhancement in `onMounted`: bail immediately if `useReducedMotion()` is true (leave static text — R8). Otherwise use `useNuxtApp().$gsap` + `$SplitText` to split the headline into chars/words and run a reveal tween (e.g. staggered y/opacity, `power3.out`).
- Rotating words (home only): after the initial reveal, cycle through `words` — animate the current word out and the next in (GSAP timeline, not per-keystroke). Start the cycle from the SSR-rendered first word. Skip the cycle entirely when `words.length <= 1` (consulting static case) or under reduced-motion.
- Clean up: revert SplitText and kill timelines/tweens on `onBeforeUnmount` (SplitText instances must be `.revert()`-ed to restore DOM).
- The global `.hero h1` rule in `sections.css` styles the headline; no headline font CSS duplicated in the component (mirror the retired component's note).

**Patterns to follow:** retired `TypewriterHeadline.vue` (aria-label + SSR-first-word + reduced-motion bail structure), `useScrollReveal.ts` (GSAP usage + scope-dispose cleanup), `gsap.client.ts` (`$SplitText` provide).

**Test scenarios** (`tests/KineticHeading.spec.ts`, harness-style mirroring the retired spec — do NOT import the SFC, which needs Nuxt auto-imports; exercise the reduced-motion gating logic directly):
- Reduced-motion set: the SSR first phrase stays in place (no split/animation rewrites it); no rotation timer/timeline scheduled. Covers R8.
- Reduced-motion NOT set: the enhancement path runs (a SplitText/animation hook is invoked, or the rotation loop schedules its first step) — asserts the gate opens.
- Single-word / static mode: rotation loop does not start (asserts no word-cycle scheduling).
- `aria-label` is stable and present regardless of motion state (accessibility name not churned).

**Verification:** Home headline reveals and rotates words on capable+motion clients; consulting headline reveals once and stays static; reduced-motion leaves both fully static; view-source shows the first phrase; Typewriter files gone; tests green.

---

### U3. HeroScene.client.vue — Three.js shader plane

**Goal:** A fullscreen, client-only, capability-gated Three.js shader plane behind the hero: animated gradient/flow with an accent `#6980ff` glow, capped DPR, paused when off-screen or when the tab is hidden.

**Requirements:** R1, R8 (via gating in U4).

**Dependencies:** U4 mounts it; this unit builds the scene in isolation.

**Files:**
- `app/components/HeroScene.client.vue` (create)

**Approach:**
- `.client.vue` suffix + dynamic `import('three')` inside `onMounted` keeps three out of the SSR graph (KTD1). Render a single absolutely-positioned `<canvas>` (or a div the renderer attaches to), `aria-hidden="true"`, `pointer-events: none`, sitting behind the hero content (`z-index` below `.shell`).
- Scene: orthographic camera + fullscreen plane with a `ShaderMaterial`. Fragment shader animates a flowing gradient using a `uTime` uniform and an `uAccent` uniform set to `#6980ff` (0.41,0.50,1.0). Keep the shader cheap (no post-processing, no loops).
- DPR cap: `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))`. Resize handler updates renderer size + resolution uniform.
- Pause logic: `IntersectionObserver` on the host element pauses the rAF loop when the hero scrolls off-screen; `document.visibilitychange` pauses when the tab is hidden. Resume on re-entry/visible. Never start the loop if reduced-motion (defense-in-depth, though U4's gate already prevents mounting).
- Cleanup on `onBeforeUnmount`: cancel rAF, disconnect observers, remove listeners, `renderer.dispose()`, dispose geometry/material, drop the canvas. Guard against WebGL context creation failure (try/catch around renderer init → emit a `fail` event or simply render nothing so U4's fallback shows).

**Patterns to follow:** `useScrollReveal.ts` (dynamic GSAP import pattern → apply to `import('three')`), `CustomCursor.vue` (rAF loop + listener lifecycle + cleanup), `useWebGLCapable.ts` (what "capable" means).

**Test scenarios:** `Test expectation: none — WebGL/Three.js scene is not unit-testable under happy-dom (no WebGL context).` Behavior is verified in Step 6 browser testing (canvas mounts on capable desktop; absent under reduced-motion/fallback; no console errors). Note this explicitly so the gap is intentional, not an oversight.

**Verification:** On a capable desktop, a `<canvas>` is present behind the hero and animates; scrolling the hero off-screen or hiding the tab stops the loop; no console errors; unmount leaves no leaked context.

---

### U4. HeroSection.vue — layer WebGL/CSS-fallback behind preserved slots

**Goal:** Keep the existing `HeroSection` slot API and props, and layer the WebGL background (when capable) or an animated CSS gradient fallback (otherwise) behind the slotted content.

**Requirements:** R2, R1 (mount gate), R8 (fallback stillness).

**Dependencies:** U3 (HeroScene), U1/U2 are slotted by the pages not by HeroSection.

**Files:**
- `app/components/HeroSection.vue` (modify)
- `app/assets/css/sections.css` (modify — add hero background layer + CSS gradient fallback + reduced-motion override)

**Approach:**
- Preserve the template's `#eyebrow`/`#headline`/`#sub`/`#ctas` slots and `downArrow`/`downArrowHref` props exactly (do not change the slot contract — both pages depend on it).
- Add a background layer as the first child of `.hero` (behind `.shell`): `<ClientOnly><HeroScene v-if="webglCapable" /></ClientOnly>` plus a `<div class="hero-bg-fallback" />` that shows when not capable. Compute `const webglCapable = useWebGLCapable()`.
- CSS (`sections.css`): position `.hero` `relative`; `.hero-bg` layer `position: absolute; inset: 0; z-index: 0; pointer-events: none;` and `.shell` gets `position: relative; z-index: 1`. `.hero-bg-fallback` is an animated CSS gradient using `--accent`/`--accent-alt` (e.g. a slow `@keyframes` gradient drift). Append `@media (prefers-reduced-motion: reduce) { .hero-bg-fallback { animation: none; } }` (static gradient under reduced-motion — R8). Keep the existing hero typography rules untouched.
- Mind the existing `.down-arrow` and grain/vignette layering — the background must sit behind content but the down-arrow and grain overlay must remain visible/interactive.

**Patterns to follow:** existing `HeroSection.vue` slot structure, `sections.css` hero block + its reduced-motion override convention, `useWebGLCapable()`.

**Test scenarios:** `Test expectation: none — HeroSection is a slot/layout wrapper with no standalone behavioral logic; the gate is exercised via useWebGLCapable (already unit-tested) and verified end-to-end in Step 6 browser testing.` Optionally add a shallow render assertion that the eyebrow/headline/sub/cta slots still render their content — include only if it does not require a full Nuxt runtime.

**Verification:** Slots render identically to before; on capable desktop the canvas layer appears behind content; on small/reduced-motion the CSS fallback shows (static under reduced-motion); down-arrow + grain still visible; no layout shift of hero text.

---

### U5. Wire pages — swap Typewriter→KineticHeading and .btn→MagneticButton (hero only)

**Goal:** Update `index.vue` and `consulting.vue` so the hero uses `KineticHeading` and `MagneticButton`. Scope strictly to the hero block; no other recompose.

**Requirements:** R6, R5, R7.

**Dependencies:** U1 (MagneticButton), U2 (KineticHeading).

**Files:**
- `app/pages/index.vue` (modify)
- `app/pages/consulting.vue` (modify)

**Approach:**
- `index.vue`: replace the `<TypewriterHeadline ... />` in `#headline` with `<KineticHeading :words="['EXPERIMENTS','CONSULTING','TRAINING']" prefix="AI " />` (or rely on defaults). Remove the `typer` reactive object, the `showTuner` ref + `onMounted` query check, the `TyperConfig` import, and the `<ClientOnly><TypewriterTuner /></ClientOnly>` block. Replace the two hero CTAs: `<a class="btn btn-filled" href="#work">See the work →</a>` → `<MagneticButton variant="filled" href="#work">See the work</MagneticButton>`; `<NuxtLink class="btn btn-ghost" to="/consulting">Consulting</NuxtLink>` → `<MagneticButton variant="ghost" to="/consulting">Consulting</MagneticButton>`. Keep the `#work`/`#about`/experiments sections untouched.
- `consulting.vue`: replace the static `<h1>Your recurring work,<br>done by a system.</h1>` in `#headline` with `<KineticHeading>` carrying the same text as static content (single-word/static mode — no rotation). Replace the two hero CTAs (`mailto:` filled, `#how` ghost) with `MagneticButton` equivalents. Leave all other sections untouched.
- Verify no dangling imports/usages of removed Typewriter symbols anywhere (grep).

**Patterns to follow:** existing slot usage in both pages; keep eyebrow/sub copy verbatim (real SSR text — R7).

**Test scenarios:** `Test expectation: none — page wiring is markup substitution; correctness is covered by U1/U2 unit tests plus Step 6 browser SSR-copy + no-console-error checks.` The grep for removed symbols is a verification step, not a unit test.

**Verification:** Both pages build; headline + sub + CTA text present in `pnpm generate` output HTML (R7); no references to `TypewriterHeadline`/`TypewriterTuner`/`TyperConfig` remain; hero CTAs are magnetic pills.

---

### U6. Green-gate sweep — typecheck, lint, test, generate

**Goal:** Confirm the full quality gate is green and no console errors surface.

**Requirements:** R9.

**Dependencies:** U1–U5.

**Files:** none (verification unit).

**Approach:** Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm generate` in the worktree. Fix any type/lint fallout scoped to this change (e.g. `@types/three` typings, unused-import lint from removed Typewriter wiring). Confirm `nuxt generate` emits the hero copy in static HTML.

**Test scenarios:** `Test expectation: none — this is the aggregate gate; behavioral coverage lives in U1/U2.`

**Verification:** All four commands exit 0; generated `/` and `/consulting` HTML contain the hero headline/sub/CTA text; browser console clean (verified in Step 6).

---

## Scope Boundaries

**In scope:** the four hero components, retiring Typewriter*, the two scoped page swaps, hero background CSS in `sections.css`, and repointed tests.

**Out of scope / Deferred to Follow-Up Work:**
- Fuller home/consulting page recompose (later redesign cycles) — only the hero block changes here.
- Removing the generic `.btn`/`.btn-filled`/`.btn-ghost` rules from `sections.css` — leave them; non-hero consumers may still use them and a later cycle owns that cleanup. (Noted so an over-eager cleanup doesn't break other pages.)
- Live-tunable kinetic timing (the retired `?tune` panel) — GSAP timing is baked, not user-tunable (KTD4).

---

## Risks & Mitigations

- **R-A — Three.js leaks into SSR bundle.** Mitigation: `.client.vue` + `<ClientOnly>` + dynamic `import('three')` (KTD1); verify `pnpm generate` succeeds and inspect that three is not in the prerender path.
- **R-B — Hydration mismatch from the headline.** Mitigation: SSR renders the real first phrase; client only *enhances* it (KTD3). The `aria-label` and visible first word are identical server/client.
- **R-C — SplitText DOM not restored on unmount** (page transitions are `out-in`). Mitigation: `.revert()` SplitText and kill timelines in `onBeforeUnmount`.
- **R-D — WebGL context creation fails on a "capable" device.** Mitigation: try/catch around renderer init; on failure render nothing so the CSS fallback (or empty bg) shows — no thrown console error.
- **R-E — Magnetic motion on touch / reduced-motion.** Mitigation: gate on `pointer: fine` + `!reduced` (KTD5), mirroring `CustomCursor`.

---

## Sources & Research

- Codebase (worktree `claudiomendonca.com-wt/PRO-111`): `HeroSection.vue`, `TypewriterHeadline.vue`, `TypewriterTuner.vue`, `app/types/typer.ts`, `app/pages/index.vue`, `app/pages/consulting.vue`, `app/composables/{useWebGLCapable,useReducedMotion,useScrollReveal}.ts`, `app/plugins/gsap.client.ts`, `app/components/CustomCursor.vue`, `app/assets/css/{tokens,sections}.css`, `tests/TypewriterHeadline.spec.ts`.
- Installed: `three@^0.184.0` + `@types/three@^0.184.1`, `gsap@^3.15.0` (ScrollTrigger + SplitText registered in `gsap.client.ts`), `lenis@^1.3.23`.
- Token: `--accent: #6980ff` in `app/assets/css/tokens.css`.
