---
title: "feat: Consulting recompose — dark restyle + stat counter + marquee (PRO-113)"
type: feat
status: active
date: 2026-06-13
ticket: PRO-113
origin: docs/plans/2026-06-13-004-feat-home-recompose-dark-cards-plan.md
---

# feat: Consulting recompose — dark restyle + stat counter + marquee (PRO-113)

## Summary

Redesign 5/6: recompose the `/consulting` page on the merged dark system. Same copy, same data (`app/data/consulting.ts`, 3 offerings), same anchors. The hero is already swapped to `HeroSection` + `KineticHeading` (static text) + `MagneticButton` from an earlier cycle. This cycle: (1) port the consulting section styles in `app/assets/css/sections.css` — offerings list, how-it-works steps, pricing, CTA banner — from the legacy `--color-*` aliases to the new semantic dark tokens (`--ink`/`--paper`/`--accent`/`--dim`/`--hairline`), the same move PRO-112 made for the home body, without regressing home styles; (2) build `StatCounter.vue`, an animated number + SVG arc that reveals on scroll for the MIT "95%" stat (GSAP + SVG, no D3), static under reduced-motion and SSR-safe; (3) build `Marquee.vue`, an infinite role/tools ticker paused under reduced-motion; (4) recompose `consulting.vue` to wire `StatCounter` into the "Not just a chatbot" MIT stat block and add an optional `Marquee`, while preserving the `ConsultingEntry`/`HowItWorks`/`CtaBanner` prop+data contracts and the `v-html` title note.

The progressive-enhancement contract is the hard constraint, identical to PRO-112: server-rendered HTML and the no-JS / reduced-motion render must show all content — every offering and the literal "95%" stat text — with no hidden start state. Hidden state and animation are applied only on the client in `onMounted`, after a `reduced.value` early return.

---

## Problem Frame

The chrome, hero, and home body are dark and on the new semantic tokens. The `/consulting` body below the hero still renders the original light-Motto layout *remapped* to dark via the legacy `--color-*` aliases in `tokens.css`. That remap keeps it legible but it is not a deliberate dark composition, and it is the last page-body still leaning on the alias layer. The page also has no motion identity of its own: the MIT "95%" credibility stat is a plain `<blockquote class="stat-callout">`, and there is no ticker. The ticket asks for two new motion primitives (`StatCounter`, `Marquee`) plus the dark restyle.

Two existing assets carry the exact enhancement contract this needs: `useScrollReveal` (PRO-109) is a no-op on SSR/no-JS and bails on reduced-motion, and `gsap.client.ts` provides `$gsap` client-only so GSAP never enters the prerender bundle. The new components must follow the same pattern PRO-111/112 components already established (`KineticHeading`, `ExperimentCard`, `MagneticButton`): static SSR markup, GSAP work in `onMounted`, reduced-motion early return, teardown on unmount.

One anchor gap: the ticket lists `#consulting / #how / #contact` as load-bearing, but the current `consulting.vue` only has `#consulting` (offerings) and `#how` (`HowItWorks`). The closing CTA section has no id. The mailto CTA the ticket references lives in that CTA banner, so the recompose must add `id="contact"` to the CTA section.

---

## Requirements

- **R1** — Consulting section styles in `sections.css` (`.entry*`, `.outcomes*`, `.steps`/`.step*`, `.cta-banner*`, `.price*`, `.stat-callout*`, `.label`, `.bio-grid`/`.bio-body` as used on this page) are ported to the dark semantic tokens (`--ink`/`--paper`/`--accent`/`--dim`/`--hairline`/`--hairline-solid`), making the dark intent explicit instead of relying on the legacy alias remap. (ticket Scope bullet "Dark section styles")
- **R2** — Home page styles do not regress: the rules shared between home and consulting (`.label`, `.section-head*`, `.bio-grid*`, `.bio-body*`, the reduced-motion block) keep working for `index.vue` after the token repoint. (ticket "do not regress home styles")
- **R3** — `ConsultingEntry.vue`, `HowItWorks.vue`, `CtaBanner.vue` keep their exact prop/data contracts and the `v-html` title note in `ConsultingEntry`; only their dark legibility (via the `sections.css` repoint) changes — no prop renames, no markup contract changes beyond optional class hooks. (ticket Scope bullet 1)
- **R4** — `StatCounter.vue`: an animated integer count-up to a target (95) plus a concentric SVG arc that sweeps to the matching fraction, revealed when scrolled into view, animating **once**. SSR renders the final value ("95%") and a complete (or static) arc as real text/markup; reduced-motion and no-JS show the final static state with no count-up. GSAP + SVG only, no D3. (ticket Scope bullet "StatCounter")
- **R5** — `Marquee.vue`: an infinite horizontal ticker (role/tools strip) that loops seamlessly; paused (held static, content fully present) under reduced-motion; SSR renders the strip content as real text. (ticket Scope bullet "Marquee")
- **R6** — `consulting.vue` is recomposed: `StatCounter` wired into the "Not just a chatbot" MIT 95% stat block (replacing or augmenting the `.stat-callout` blockquote, keeping the MIT citation and the "95%" text), and an optional `Marquee` placed where a role/tools strip reads well. `app/data/consulting.ts` is unchanged; ids `#consulting`, `#how`, and `#contact` are all present (the CTA section gains `id="contact"`). (ticket Scope bullet "consulting.vue")
- **R7** — Progressive enhancement: no hidden start state in SSR HTML; reduced-motion and JS-off both show all 3 offerings, the full MIT stat text including the literal "95%", and the marquee content. View-source of the generated HTML contains all of it. (ticket AC, PRO-109 R7 contract)
- **R8** — Full consulting scroll works at 375 / 768 / 1280 / 1440; `#consulting`/`#how`/`#contact` anchors land; mailto CTAs (`mailto:claudioccm@gmail.com`) intact in hero and CTA banner; offerings/pricing/CTA legible on dark. (ticket AC)
- **R9** — `pnpm typecheck` + `pnpm lint` + `pnpm test` + `pnpm generate` green; no console errors at any breakpoint. (ticket AC)

---

## Key Technical Decisions

- **KTD1 — Restyle by repointing tokens, mirroring PRO-112; do not rewrite the layout.** The consulting rules in `sections.css` move from `--color-pitch-black` / `--color-canvas-white` / `--color-charcoal-surface` / `--color-cloud-gray` / `--color-stone-accent` / `--color-ash-text` to the semantic tokens (`--paper` for text/borders-on-dark, `--ink`/`--raised` for surfaces, `--dim` for secondary text, `--hairline`/`--hairline-solid` for separators, `--accent` for a sparing tint). Layout, spacing, clamps, and breakpoints are preserved — this is the same surgical repoint PRO-112 (KTD4) applied to the home body. Accent is used sparingly (e.g. entry index, outcomes arrow, stat arc) to match the home cards' "mono dim → accent on interaction" restraint, not as a flat fill.
- **KTD2 — Shared rules are repointed once and verified against both pages.** `.label`, `.section-head*`, `.bio-grid*`, `.bio-body*`, and the `@media (prefers-reduced-motion)` block are used by `index.vue` too. They are already partly on semantic tokens (`.bio-grid h2` → `--paper`, `.experiment-caption` → `--hairline`). The remaining `--color-*` references in consulting-only rules are repointed; any shared rule that still uses an alias is repointed to the token its alias maps to (no visual change on home, since the alias already resolves to that token) so the dark intent is explicit and home stays pixel-identical. R2 is verified by a home browser pass at STEP 6.
- **KTD3 — `StatCounter` is a self-contained component owning its own reveal + count + arc; it reuses `useReducedMotion` but not `useScrollReveal`.** `useScrollReveal` does an opacity/`y` transform reveal of an element; `StatCounter` needs a *value* count-up and an arc `stroke-dashoffset` sweep triggered when in view — a different effect shape. So it implements its own `ScrollTrigger` (`once: true`) inline in `onMounted`, mirroring the client-only dynamic-import + reduced-motion-bail + `onScopeDispose`-kill pattern of `useScrollReveal.ts` and `ExperimentCard.vue` parallax. The SVG arc is drawn with `stroke-dasharray`/`stroke-dashoffset`; SSR/no-JS/reduced-motion render it at the final offset (full sweep) and the final number, so the static state is complete and correct.
- **KTD4 — `StatCounter` is data-driven via props so the "95%" and the MIT copy stay declarative in the page.** Props: `value` (number, e.g. `95`), `suffix` (string, e.g. `'%'`), `label`/`caption` slots or props for the surrounding copy + citation. The literal target number is rendered as real text in SSR (the count-up only animates *to* it on the client), so view-source carries "95%" (R7). The MIT citation (`— MIT, State of AI in Business 2025`) is passed through and always rendered.
- **KTD5 — `Marquee` duplicates its track for a seamless CSS loop; JS is not required for the animation.** The infinite scroll is a pure CSS `@keyframes` translateX on a doubled track (two identical `<ul>`s side by side, the animation shifts by `-50%`), which is the standard seamless-marquee technique and needs no GSAP. Reduced-motion pauses it via the existing `@media (prefers-reduced-motion: reduce)` override (`animation: none`), leaving the content static and fully readable. Items come from a prop (`string[]`) so the page owns the role/tools copy; the second copy of the track is `aria-hidden` so screen readers read the list once. This keeps `Marquee` SSR-trivial (no `onMounted` needed) and the "paused on reduced-motion" requirement is a one-line CSS rule.
- **KTD6 — `Marquee` is optional per the ticket; include it as a thin role/tools strip between the positioning copy and the offerings, only if it reads well.** The ticket marks the marquee "optional". Default decision: include it (it is low-risk, pure CSS, and gives the page motion identity), placed as a quiet strip. If at STEP 6 it reads as noise on any breakpoint, it can be dropped from `consulting.vue` without touching the component. Recorded as the default; revisit at browser pass.
- **KTD7 — New section styles for `StatCounter`/`Marquee` live in `sections.css` in the same dark vocabulary, appended after the existing consulting block.** No scoped styles in the new components for layout/color (matching the repo convention that visual rules live in `sections.css`); the components carry only structural/animation-critical inline pieces (e.g. the SVG, the dasharray). Reduced-motion neutralization for both is added to the existing `@media (prefers-reduced-motion: reduce)` block at the bottom of `sections.css`.

---

## Scope Boundaries

In scope: the consulting rules in `app/assets/css/sections.css` (offerings/`.entry*`, `.outcomes*`, `.steps`/`.step*`, `.cta-banner*`, `.price*`, `.stat-callout*`, consulting-used `.label`/`.bio-*`) repointed to dark tokens + new `StatCounter`/`Marquee` rules + reduced-motion additions; new `app/components/StatCounter.vue` and `app/components/Marquee.vue` (+ their `tests/` specs); `app/pages/consulting.vue` recompose (wire StatCounter, add Marquee, add `id="contact"`); no behavioral change to `ConsultingEntry.vue`/`HowItWorks.vue`/`CtaBanner.vue` beyond optional class hooks.

Out of scope:
- `app/data/consulting.ts` — copy and data shape unchanged; the page iterates it as-is.
- The hero block of `consulting.vue` — already recomposed (`HeroSection` + `KineticHeading` static text + `MagneticButton`); this cycle must not undo it.
- `tokens.css` (the alias layer stays as-is — this cycle stops *consuming* aliases on consulting, it does not delete them — other unported surfaces may still rely on them), `base.css`, `chrome.css`, `gsap.client.ts`, `lenis.client.ts`, `useScrollReveal.ts`, `useReducedMotion.ts` — consumed, not modified.
- `index.vue` and the home-only `sections.css` rules (`.experiments-grid`, `.experiment*`) — not touched; only verified non-regressed.

### Deferred to Follow-Up Work
- Real pricing numbers — the `9999,00` placeholders in `consulting.vue` are pre-existing and out of scope here (owner-deferred copy); they ship as-is, restyled.
- Redesign 6/6 (final pass / remaining surfaces) — separate cycle.

---

## High-Level Technical Design

`StatCounter` client enhancement lifecycle (SSR render is the complete static stat — final number + full arc):

```
SSR / no-JS render:  <figure.stat-counter> → <svg>(arc at final offset) + <span.stat-num>95</span><span>%</span> + <figcaption>(MIT cite)   [fully visible, final value]
                                   │
                              client onMounted
                                   │
                    reduced-motion? ──yes──▶ no-op (final static stat stays: 95% + full arc)
                                   │ no
                                   ▼
        set start state on CLIENT only:  number → 0, arc stroke-dashoffset → full (hidden sweep)
        ScrollTrigger { trigger, start 'top 85%', once: true }:
            gsap.to(counter, { val: 95, onUpdate → write rounded number })   ── count up
            gsap.to(arc,     { strokeDashoffset: targetOffset })             ── sweep arc
                                   │
                              onScopeDispose → kill trigger + tweens
```

`Marquee` (no JS lifecycle — pure CSS loop):

```
<div.marquee>(overflow hidden)
  └ <div.marquee-track>(animation: marquee-scroll Ns linear infinite)
       ├ <ul.marquee-group>            (items × N)      [read by AT]
       └ <ul.marquee-group aria-hidden> (items × N, dup) [visual seam filler]
  @keyframes marquee-scroll { to { transform: translateX(-50%) } }
  @media (prefers-reduced-motion: reduce) { .marquee-track { animation: none } }   ── paused, content static
```

---

## Implementation Units

### U1. Port consulting section styles in `sections.css` to dark tokens

**Goal:** Make the offerings list, how-it-works steps, pricing rows, CTA banner, and the stat-callout/`.label` rules a deliberate dark composition on the semantic tokens, without regressing home.
**Requirements:** R1, R2, R3 (legibility via styles), R7 (reduced-motion block).
**Dependencies:** none (U4/U5 append new rules; U6 references class names).
**Files:**
- `app/assets/css/sections.css` (modify — consulting rules + shared `.label`/`.bio-*` where they still reference `--color-*`; extend the reduced-motion block)

**Approach:**
- Repoint, rule by rule, the consulting-block selectors from the legacy aliases to the token each alias resolves to in `tokens.css`: `--color-pitch-black` → `--paper` (text, idx, headings, hairline borders that were "ink-on-white" and are now "light-on-dark"), `--color-ash-text` → `--dim` (secondary body, taglines-secondary, price notes, citations), `--color-stone-accent` → `--hairline-solid` (the outcomes column divider), `--color-canvas-white`/`--color-cloud-gray` → `--ink`/`--raised` if any surface fills appear. Borders that should read as faint separators (`.entry` top/bottom, `.step` top, `.cta-banner` top/bottom, `.price-row` top) move to `--hairline` (rgba) where a hairline is wanted, or `--hairline-solid` where rgba layering is wrong — match the `.experiment-caption`/`.experiments-grid` precedent already in the file.
- Add a sparing `--accent` tint to echo the home restraint: e.g. the `.entry .idx` or the `.outcomes li::before` arrow may tint `--accent` (pick one focal accent, do not flood). Keep it consistent with `.experiment .idx` going `--accent` on hover.
- Repoint the shared `.label` / `.label::before` (currently `--color-ash-text` / `--color-pitch-black`) and any consulting-used `.bio-grid`/`.bio-body` references to the resolved tokens; since the alias already maps to that token, home renders identically (KTD2). Do not touch the home-only `.experiments-grid`/`.experiment*` rules.
- Extend the `@media (prefers-reduced-motion: reduce)` block only if U1 introduces any new transition (e.g. an accent color fade on idx) — narrow to color-only rather than removing, matching the existing `.btn` treatment.

**Patterns to follow:** the PRO-112 home repoint already in `sections.css` (`.experiment*` rules on `--paper`/`--raised`/`--dim`/`--accent`/`--hairline`); the existing reduced-motion block at the bottom of the file.

**Test scenarios:** `Test expectation: none -- pure styling; verified visually at STEP 6 at all four breakpoints (offerings/pricing/CTA legible on dark, accent restraint, hairline separators) plus a home regression pass (R2) and the reduced-motion emulation check.`

**Verification:** Consulting sections read light-on-dark with sparing accent; home page unchanged at all breakpoints; no `--color-*` alias remains in the consulting-specific rules; reduced-motion shows no new motion.

---

### U2. `StatCounter.vue` — animated number + SVG arc, reveal-once, SSR-safe

**Goal:** Build the stat component: count-up to the target + arc sweep on scroll into view, static final state on SSR/no-JS/reduced-motion.
**Requirements:** R4, R7.
**Dependencies:** none (U6 consumes it; U4 styles it).
**Files:**
- `app/components/StatCounter.vue` (create)
- `tests/StatCounter.spec.ts` (create — harness mirroring the component's non-GSAP logic, per the repo's `tests/ExperimentCard.spec.ts` convention)

**Approach:**
- Props (KTD4): `value: number` (e.g. 95), `suffix?: string` (default `'%'`), `label?: string` (short stat label, e.g. "of AI pilots stall"), and a default slot or `caption`/`cite` props for the surrounding MIT sentence + citation. Derive the displayed number and the arc target fraction (`value / 100`, clamped) as computed values.
- Template: a `<figure>` (or `<div>`) with an inline `<svg>` drawing a background ring + a foreground arc `<circle>`/`<path>` using `stroke-dasharray` = circumference and `stroke-dashoffset` set so the **SSR/default** state shows the **full** arc (final state); a `<span class="stat-num">` rendering the literal `value` (so view-source has "95") + the suffix; and the caption/citation. The accessible text reads the final value, not "0".
- `onMounted` (KTD3): early-return on `reduced.value` (reuse `useReducedMotion`). Otherwise grab `$gsap` from `useNuxtApp()` (and dynamically import `gsap/ScrollTrigger`, register), set the client-only start state (number → 0, arc offset → full circumference so the sweep is hidden), then create a `ScrollTrigger`-driven `gsap.to` with `once: true` that (a) tweens a proxy value 0→`value` writing the rounded integer into the number node on `onUpdate`, and (b) tweens the arc `strokeDashoffset` to the target offset. Kill trigger + tweens in `onScopeDispose`/`onBeforeUnmount` (page transitions are out-in).
- Guard: if `$gsap` is missing, leave the static final state (same as reduced-motion). No GSAP import at module scope.

**Patterns to follow:** `app/composables/useScrollReveal.ts` (client-only dynamic import, `reduced` bail, `onScopeDispose` kill, `once: true`); `app/components/KineticHeading.vue` (`useNuxtApp().$gsap`, `onMounted`/`onBeforeUnmount` teardown, SSR-real text); `app/components/ExperimentCard.vue` (inline ScrollTrigger effect in a component).

**Test scenarios** (happy path + SSR-safety, mirroring `ExperimentCard.spec.ts` harness style — the GSAP count/sweep is a client-only onMounted effect verified at STEP 6, not in happy-dom):
- Renders the final `value` + `suffix` as real text in the static markup (`value=95`, `suffix='%'` → markup contains "95" and "%"). Covers R4/R7.
- Renders the passed label/caption and the MIT citation text in the static markup.
- Default suffix is `'%'` when omitted; a custom suffix (e.g. `'x'`) renders instead.
- SVG arc renders with a `stroke-dasharray`/`stroke-dashoffset` such that the **static** markup shows the completed arc (no hidden start state in SSR markup — no inline `opacity:0`). Covers R7.
- Accessible: the rendered figure exposes the final stat text (e.g. an `aria-label`/`figcaption` reading "95% …"), not "0%".

**Verification:** Component test green; static markup carries the final number + citation; no GSAP in the SSR bundle (dynamic import / `$gsap` only); at STEP 6 the number counts up and the arc sweeps once when scrolled into view, and stays static under reduced-motion.

---

### U3. `Marquee.vue` — seamless CSS ticker, paused on reduced-motion, SSR-safe

**Goal:** Build the infinite role/tools ticker as a pure-CSS seamless loop with the content fully present in SSR and paused under reduced-motion.
**Requirements:** R5, R7.
**Dependencies:** none (U6 consumes it; U4 styles it).
**Files:**
- `app/components/Marquee.vue` (create)
- `tests/Marquee.spec.ts` (create — harness per repo convention)

**Approach:**
- Props: `items: string[]` (the role/tools strings), optional `ariaLabel?: string` for the list, optional `durationSeconds?: number` (default sensible, e.g. 30) bound to the animation via an inline custom property or class. No `onMounted`, no GSAP (KTD5).
- Template: an outer `.marquee` (overflow hidden, `role`/`aria-label` as appropriate) wrapping a `.marquee-track`; the track holds **two** identical `<ul class="marquee-group">` lists of the items — the first is the readable list, the second is `aria-hidden="true"` to fill the seam. Each item is an `<li>`. The track animates `translateX(0 → -50%)` infinitely (defined in `sections.css`, U4).
- SSR: the items render as real text in the first (and second) group, so view-source carries the strip content (R7).
- Reduced-motion: handled entirely by the CSS `animation: none` override in U4 — the duplicated track simply sits static and the content is fully readable. No JS branch needed; document this in a component comment.

**Patterns to follow:** the repo convention of no scoped layout/color styles (rules in `sections.css`); `aria-hidden` duplication is the standard seamless-marquee a11y pattern; SSR-real text like `ConsultingEntry`/`ExperimentCard`.

**Test scenarios:**
- Renders every `items` string in the static markup (e.g. `['Design','Engineering','AI']` → all three present).
- Renders two copies of the item set (the visible group + the `aria-hidden` duplicate), and the duplicate group carries `aria-hidden="true"` so AT reads the list once. Covers R5/R7 (content present) + a11y.
- Applies the list `ariaLabel` to the readable group when provided.
- No hidden start state / no inline opacity:0 in the static markup (R7).
- `durationSeconds` prop is reflected (e.g. via inline `--marquee-duration` custom property) when provided; falls back to the default when omitted.

**Verification:** Component test green; both track copies render with all items; the duplicate is `aria-hidden`; at STEP 6 the strip scrolls seamlessly and is paused/static under reduced-motion.

---

### U4. New section styles for `StatCounter` + `Marquee` in `sections.css`

**Goal:** Style the two new components in the dark vocabulary and add their reduced-motion neutralization.
**Requirements:** R1 (dark vocabulary), R4/R5 (visual + animation rules), R7 (reduced-motion).
**Dependencies:** U1 (token vocabulary established); U2/U3 reference these class names.
**Files:**
- `app/assets/css/sections.css` (modify — append `.stat-counter*` and `.marquee*` rules + reduced-motion additions)

**Approach:**
- `.stat-counter`: a layout for the SVG ring + the big number, on `--paper` text with the arc stroke in `--accent` (the focal accent for the page) and the background ring in `--hairline`/`--hairline-solid`. Number in `--font-disp` at a large clamp, suffix smaller; caption in `--dim`, citation reusing the `.stat-callout cite` size. Keep `overflow`/`will-change` minimal.
- `.marquee` / `.marquee-track` / `.marquee-group` / `li`: overflow-hidden container; flex track; the `@keyframes marquee-scroll { to { transform: translateX(-50%) } }`; `animation` on `.marquee-track` using the duration custom property with a sensible default; items in `--dim` or `--paper` with `--font-mono` or `--font-sans` separators (e.g. a `·` or hairline). A subtle edge fade (mask-image) is optional.
- Extend the `@media (prefers-reduced-motion: reduce)` block: `.marquee-track { animation: none !important; }` and neutralize any `.stat-counter` transition introduced (the count/sweep is JS and already bails, so CSS only needs to ensure no residual motion).

**Patterns to follow:** existing dark token usage in the home `.experiment*` rules and the `.stat-callout`/`.price*` consulting rules; the existing reduced-motion block.

**Test scenarios:** `Test expectation: none -- pure styling; verified visually at STEP 6 (stat ring + number legible on dark, accent arc; marquee scrolls seamlessly and is static under reduced-motion).`

**Verification:** Stat counter and marquee render in the dark vocabulary; reduced-motion emulation shows the marquee paused and the stat static; no contrast regressions.

---

### U5. Recompose `consulting.vue` — wire `StatCounter`, add `Marquee`, add `#contact`

**Goal:** Wire the new components into the page and close the anchor gap, keeping copy/data/contracts intact.
**Requirements:** R6, R7, R8.
**Dependencies:** U2 (StatCounter), U3 (Marquee), U4 (styles).
**Files:**
- `app/pages/consulting.vue` (modify — the "Not just a chatbot" stat block, an optional Marquee placement, and `id="contact"` on the CTA section; leave the hero block and `consultingOfferings` iteration intact)

**Approach:**
- In the "Not just a chatbot" section, replace (or wrap) the `<blockquote class="stat-callout">` with `<StatCounter :value="95" suffix="%" ... >` passing the MIT sentence and citation as the caption/slot so the literal "95%" and the MIT attribution are preserved (R6, R7). Keep the surrounding "Not just a chatbot" copy and the `.bio-grid` framing.
- Add an optional `<Marquee :items="[...roles/tools...]" aria-label="Roles and tools" />` as a quiet strip (KTD6) — default placement between the positioning ("The brief.") section and the offerings (`#consulting`), or just under the hero, wherever it reads as a divider rather than noise. Items are page-owned copy (e.g. a short role/tools list); no new data module.
- Add `id="contact"` to the section that renders `CtaBanner` (the mailto CTA lives there) so `#contact` is a real anchor (R8). The `CtaBanner` component wraps its own `<section>`, so either add the id to a wrapping element in `consulting.vue` or pass it through — prefer wrapping in the page to avoid changing the `CtaBanner` contract (R3). Keep the existing hero `#consulting`/`#how` deep links and both `mailto:claudioccm@gmail.com` CTAs.
- Do not touch `consultingOfferings`, `ConsultingEntry`, `HowItWorks`, or `CtaBanner` props. The `v-html` title note in `ConsultingEntry` stays as-is.

**Patterns to follow:** `app/pages/index.vue` (component wiring, `useHead`/`useSeoMeta` left intact, section ids preserved); the existing `consulting.vue` hero block and offerings `v-for`.

**Test scenarios:** `Test expectation: none -- page composition is covered by the U2/U3 component tests and the STEP 6 browser/SSR checks (all 3 offerings + the literal "95%" + MIT citation present with JS off; #consulting/#how/#contact anchors land; both mailto CTAs intact).`

**Verification:** Page renders with StatCounter in the MIT block and the marquee strip; `#consulting`/`#how`/`#contact` all resolve; both mailto CTAs present; generated HTML (view-source) contains all 3 offerings, the "95%" text, and the MIT citation.

---

## Verification Strategy

- `pnpm typecheck` + `pnpm lint` + `pnpm test` + `pnpm generate` all green (R9). No `.github/workflows` exist, so this local quad is the CI gate.
- Browser pass at 375 / 768 / 1280 / 1440: full consulting scroll; offerings/pricing/CTA legible on dark; `#consulting`/`#how`/`#contact` anchors land; both `mailto:` CTAs intact; the StatCounter number counts up + arc sweeps **once** when scrolled into view; the Marquee scrolls seamlessly.
- Reduced-motion emulation: StatCounter shows the final static "95%" + full arc (no count-up); Marquee is paused/static; both fully readable.
- Progressive enhancement (R7): with JS disabled (view-source of the generated HTML), all 3 offering titles, the full MIT stat sentence including the literal "95%", the MIT citation, and the marquee items are present — no hidden start state.
- Home regression (R2): a quick home pass confirms `#work`/`#about` and the cards are visually unchanged after the shared-rule token repoint.
- No console errors at any breakpoint.

---

## Risks & Dependencies

- **R-A — Shared-rule regression on home.** Repointing `.label`/`.section-head*`/`.bio-*` could shift the home page. Mitigation: each alias is repointed to the exact token it already resolves to (KTD2), so home is pixel-identical; verified by a home browser pass (R2) at STEP 6.
- **R-B — StatCounter hidden start state leaking into SSR.** If the count-up's "0" or the hidden-arc offset is set at render time rather than in `onMounted`, view-source would show "0%" or an empty ring, breaking R7. Mitigation: SSR/default state is the **final** value + full arc; the 0/hidden-offset start state is applied only on the client after the reduced-motion bail (KTD3) — exactly the `useScrollReveal` contract, asserted in the U2 spec.
- **R-C — GSAP entering the SSR/prerender graph.** Mitigation: `StatCounter` uses `$gsap` from `useNuxtApp()` and/or dynamic `import()` inside `onMounted` after the reduced-motion bail, mirroring `KineticHeading`/`useScrollReveal`; no module-scope GSAP import. `Marquee` uses no GSAP at all.
- **R-D — Marquee seam/jank or reduced-motion not actually pausing.** Mitigation: the doubled-track `-50%` technique is seam-free by construction; the reduced-motion pause is a single `animation: none` rule in the existing media block (U4), verified under emulation at STEP 6.
- **R-E — `#contact` anchor added in a way that changes the `CtaBanner` contract.** Mitigation: wrap the id on a page-level element rather than adding a prop to `CtaBanner` (R3, KTD per U5), keeping the component contract untouched.
