---
title: "refactor: Frontend quality cleanup — claudiomendonca.com (audit v0.5)"
status: active
date: 2026-06-08
ticket: PRO-95
origin: lab/skills-hatchery/claudiomendonca-com-audit.md
---

# refactor: Frontend quality cleanup — claudiomendonca.com (audit v0.5)

## Summary

Apply the 8 Pass-1 findings from the `nuxt-vue-quality` v0.5 audit (run 4, score 8.9/10) to bring the site into full consistency with its own conventions. The site is already healthy — no criticals, no majors — so all fixes are `minor` or `nit`. Group fixes into atomic-ish commits by area: docs/README hygiene, shared types/utils, component cleanups, accessibility, footer styling, and a Vitest harness with two starter specs.

The 2 Pass-2 modernization items in the audit are **deferred** (Baseline-limited per the audit's own recommendation). The "noticed but not touched" items are **out of scope** for this PR.

---

## Problem Frame

The audit identified small drift between the codebase's stated conventions and 8 concrete spots that don't follow them:

- README references `/services` instead of `/consulting` (stale from PRO-78 rename).
- A `TyperConfig` shape is duplicated across three call sites with one untyped.
- A small `padStart` formatter is inlined in two places.
- The footer wordmark uses inline `style=""` despite the project's promote-to-class convention.
- One SFC (`SiteNav.vue`) is missing `lang="ts"`.
- The experiments grid uses `role="list"`/`role="listitem"` instead of native `<ul><li>`, even though the consulting page already uses the native pattern.
- There is no test harness; two non-trivial pieces of logic (typewriter animation loop, route-aware nav links) are untested.
- The formatter choice (ESLint stylistic ruleset, no Prettier) is undocumented.

None of these are bugs. They are consistency, type-rigor, and a11y cleanups that strengthen the codebase before further feature work lands.

---

## Requirements (traced to audit findings)

- **R1** Fix stale `/services` references in `README.md` and the `04-services-page.md` doc (audit · Dim 1).
- **R2** Extract `TyperConfig` into one shared TypeScript type used by both components and the page (audit · Dim 3).
- **R3** Extract `padIndex(n)` utility, used in `ExperimentCard.vue` and `ConsultingEntry.vue` (audit · Dim 4).
- **R4** Promote 3 inline `style=""` attributes in `SiteFooter.vue` brand block to classes in `chrome.css` (audit · Dim 6).
- **R5** Add `lang="ts"` to `SiteNav.vue` (audit · Dim 7).
- **R6** Replace `role="list"` retrofit in experiments grid with native `<ul><li>`; drop `role="listitem"` from card (audit · Dim 8).
- **R7** Add Vitest harness + 2 starter specs (`SiteNav` link computed, `TypewriterHeadline` reduced-motion) and an `npm run test` script (audit · Dim 12).
- **R8** Document the formatter choice in `README.md` (audit · Dim 12, nit).

**Quality gates (must remain green):** `nuxt prepare`, `nuxt typecheck`, `npm run lint`.

---

## Scope Boundaries

### In scope

- All 8 Pass-1 findings (R1–R8).

### Deferred to Follow-Up Work

- **Pass 2 · T15** — `@container scroll-state(scrollable: top)` for the nav scroll listener (Baseline: Limited; Chrome 133+ only). Track, revisit in 12–18 months.
- **Pass 2 · T2** — Scroll-driven animation for nav border fade (Baseline: Newly available; Firefox still flagged). Apply once Firefox ships unflagged.
- **Noticed but not touched** (from audit): placeholder `href="#"` in `SiteFooter.vue:36-37`; `9999,00` placeholder prices in `consulting.vue:135-155`; non-standard `aria-current-value="false"` attribute; `vue/no-multiple-template-root` wrapper `<div>`s; `scroll-margin-top` UX nit.

### Out of scope (non-goals)

- Visual/copy changes beyond the footer brand class swap (which must produce no visible diff).
- ESLint config changes or rule tightening.
- Production CI configuration. The brief mentions "CI runs `typecheck && lint && test`" — there is no GitHub Actions workflow in the repo today. We add the `test` script and ensure local `npm run typecheck && npm run lint && npm run test` is green; wiring a CI workflow is its own ticket.

---

## Key Technical Decisions

### KTD1 — Group changes by area, not by audit-finding

Each Implementation Unit clusters related findings so a reviewer reads one coherent diff per file area. Mapping is explicit in Requirements Traceability below. This is cheaper to review than 8 micro-commits and respects the "atomic commit per meaningful change" convention.

### KTD2 — Shared types live in `app/types/`, utilities in `app/utils/`

The repo currently has neither directory. Both are Nuxt 4 idiomatic locations and auto-imports apply (`utils/` is auto-imported; `types/` is referenced via `~/types/`). Creating both as part of this work establishes the convention.

### KTD3 — Keep `TyperConfig` as the shared interface name

The audit brief says `TyperConfig`; the existing local interface in `TypewriterTuner.vue` is `TuneConfig`. Use `TyperConfig` from the brief — it reads more naturally (the config configures the *typer*), and we're touching all three call sites anyway. The `defineModel<TyperConfig>('config', ...)` annotation in `TypewriterTuner.vue` stays semantically identical.

### KTD4 — Vitest with `happy-dom`, not `jsdom`

`happy-dom` is faster and the brief specifies it. Standard Nuxt 4 + Vitest pairing. Specs run with `vitest run`; no watch mode needed for CI parity.

### KTD5 — Two starter specs only; no broad coverage target

The audit calls out two specific high-value targets:
1. `TypewriterHeadline.vue` animation loop respecting `prefers-reduced-motion` (early-return path).
2. `SiteNav.vue` `links` computed flipping `href` based on `route.path`.

Both are tested in isolation as composable-style logic. We do not attempt component-mount tests beyond what the brief asks for — that's a follow-up.

### KTD6 — `04-services-page.md` strategy: rename to `04-consulting-page.md`

The brief offers two options (rename, or add a top-line note). Rename is cleaner — it eliminates a future grep hit and matches the page's actual route. Update README's section-3 list accordingly. We also update inline references in the doc body.

### KTD7 — Footer brand wrapper `<div class="footer-brand">`

The brief asks for `.footer-brand .wordmark`, `.wordmark .ast`, `.footer-brand .tagline`. The existing footer markup wraps the brand column in a bare `<div>`. We add the `footer-brand` class to that `<div>` (no extra DOM node) and add `class="tagline"` to the `<p>`. The `.wordmark .ast` selector already exists in `chrome.css:64`; we override only the footer-specific `font-size` for `.ast` inside `.footer-brand`.

---

## Implementation Units

### U1. README + docs hygiene

- **Goal:** Stop referring to a `/services` route that doesn't exist.
- **Requirements:** R1, R8.
- **Dependencies:** none.
- **Files:**
  - `README.md` (modify)
  - `04-services-page.md` → rename to `04-consulting-page.md` (modify body references too)
- **Approach:**
  - In `README.md`: change `/services` → `/consulting` on lines 14 and 21; update the section-3 list item to read "`04-consulting-page.md` — The Consulting page (`/consulting`)…"; update the TL;DR phrase "plus a dedicated Services page" → "plus a dedicated Consulting page".
  - Add a one-line formatter note in `README.md` (new section or appended line at the end of the intro): "Formatting is enforced by `@nuxt/eslint`'s stylistic ruleset via `npm run lint`; run `npm run lint:fix` before committing."
  - `git mv 04-services-page.md 04-consulting-page.md`. Inside the renamed file, update the `# 04 — Services Page (/services)` heading and any in-text "Services page" / `/services` mentions to "Consulting".
- **Patterns to follow:** none — pure docs.
- **Test scenarios:** *Test expectation: none — docs-only, no behavioral change.*
- **Verification:** `grep -rn "/services" README.md 04-*.md docs/` returns 0 hits; `grep -i "format" README.md` shows the new line.

### U2. Shared `TyperConfig` type

- **Goal:** One source of truth for the typewriter tuning shape.
- **Requirements:** R2.
- **Dependencies:** none. (Must land before/with U3 because U3 imports it.)
- **Files:**
  - `app/types/typer.ts` (new)
  - `app/components/TypewriterTuner.vue` (modify)
  - `app/components/TypewriterHeadline.vue` (modify props shape via re-use)
  - `app/pages/index.vue` (modify reactive annotation)
- **Approach:**
  - New file exports `export interface TyperConfig { typeMs: number; deleteMs: number; holdMs: number; betweenMs: number; cursorBlinkMs: number }`.
  - In `TypewriterTuner.vue`: remove the local `TuneConfig` interface; `import type { TyperConfig } from '~/types/typer'`; change `defineModel<TuneConfig>` → `defineModel<TyperConfig>`; change `DEFAULTS: TuneConfig` → `DEFAULTS: TyperConfig`.
  - In `TypewriterHeadline.vue`: the `Props` interface currently inlines the same 5 numeric fields plus `words` and `prefix`. Extract the 5 fields into a `Pick<TyperConfig, …>` or refactor `Props` to extend `Partial<TyperConfig>`. Cleanest: `interface Props extends Partial<TyperConfig> { words?: string[]; prefix?: string }`. Defaults stay in `withDefaults`.
  - In `pages/index.vue`: `import type { TyperConfig } from '~/types/typer'`; annotate `const typer = reactive<TyperConfig>({ … })`.
- **Patterns to follow:** Nuxt 4 auto-import path `~/types/*`. The existing `ExperimentCard.vue` / `ConsultingEntry.vue` `Props` interface style.
- **Test scenarios:** *Test expectation: none — pure type refactor; verified by `npx nuxt typecheck`.*
- **Verification:** `npx nuxt typecheck` exits 0; `grep -rn "interface TuneConfig\b" app/` returns 0 hits; `grep -rn "TyperConfig" app/` shows exactly the expected imports/annotations.

### U3. Shared `padIndex` utility

- **Goal:** Remove the duplicated `padStart` formatter.
- **Requirements:** R3.
- **Dependencies:** none.
- **Files:**
  - `app/utils/format.ts` (new)
  - `app/components/ExperimentCard.vue` (modify)
  - `app/components/ConsultingEntry.vue` (modify)
- **Approach:**
  - `app/utils/format.ts` exports `export function padIndex(n: number): string { return String(n).padStart(2, '0') }`.
  - In both components, replace `const idxLabel = computed(() => String(props.idx).padStart(2, '0'))` with `const idxLabel = computed(() => padIndex(props.idx))`. Nuxt's `utils/` directory is auto-imported, so no explicit import is required (matches the project's existing convention of relying on Nuxt auto-imports for `ref`, `computed`, `useRoute`, etc.).
- **Patterns to follow:** Nuxt 4 auto-imported `app/utils/*` pattern.
- **Test scenarios:** *Test expectation: none — covered indirectly by typecheck and the existing rendering. Could be added to Vitest in U7 if trivial, but not in scope per the audit's two-spec target.*
- **Verification:** `grep -rn "padStart" app/` returns exactly one hit, in `app/utils/format.ts`.

### U4. Promote footer wordmark inline styles to classes

- **Goal:** Match the project's promote-inline-to-class convention; eliminate three `style=""` attrs from `SiteFooter.vue`.
- **Requirements:** R4.
- **Dependencies:** none.
- **Files:**
  - `app/assets/css/chrome.css` (modify — add footer-brand rules)
  - `app/components/SiteFooter.vue` (modify — add wrapper class, drop inline styles)
- **Approach:**
  - In `chrome.css`, after the existing `.wordmark .ast` block (~line 64-68), add:
    - `.footer-brand .wordmark { font-size: var(--text-subheading); }`
    - `.footer-brand .wordmark .ast { font-size: 28px; }`
    - `.footer-brand .tagline { max-width: 34ch; margin-top: 24px; }`
  - In `SiteFooter.vue`:
    - Add `class="footer-brand"` to the brand-column `<div>` (line 11).
    - Drop `style="font-size: var(--text-subheading);"` from `NuxtLink` (line 12).
    - Drop `style="font-size: 28px;"` from inner `<span class="ast">` (line 13).
    - Replace the `<p class="t-body ash" style="max-width: 34ch; margin-top: 24px;">` with `<p class="t-body ash tagline">` (line 16).
- **Patterns to follow:** existing class-based selectors in `chrome.css` (e.g., `.nav-inner`, `.footer-grid`).
- **Test scenarios:**
  - **Visual diff (manual):** Open `/` in dev; the footer brand column renders identically (wordmark size, asterisk size, tagline width and top margin).
  - *No automated test — visual regression. Browser test step covers this.*
- **Verification:** `grep -rn 'style="' app/components app/pages` returns only the dynamic `:style` binding in `TypewriterHeadline.vue:128`.

### U5. Add `lang="ts"` to `SiteNav.vue`

- **Goal:** All SFCs use TypeScript script blocks.
- **Requirements:** R5.
- **Dependencies:** none.
- **Files:** `app/components/SiteNav.vue` (modify)
- **Approach:**
  - Change line 1 from `<script setup>` to `<script setup lang="ts">`.
  - Tighten light typings: type the `NavLink` shape (`interface NavLink { label: string; href: string; routeMatch: string | null; hideSm?: boolean }`) and use it for the `links` computed return type. Type `handleScroll` as `(() => void) | null`. Keep scope minimal — no behavioral change.
- **Patterns to follow:** the `Props` / `interface` style used across the other SFCs.
- **Test scenarios:** *Test expectation: covered by U7 SiteNav spec.*
- **Verification:** `grep -rL 'lang="ts"' app/components app/pages app/layouts` returns no files.

### U6. Experiments grid → native `<ul><li>`

- **Goal:** Replace the `role="list"` / `role="listitem"` retrofit with the same native pattern the consulting page already uses.
- **Requirements:** R6.
- **Dependencies:** none.
- **Files:**
  - `app/pages/index.vue` (modify)
  - `app/components/ExperimentCard.vue` (modify)
  - `app/assets/css/sections.css` (modify — `.experiments-grid` rule)
- **Approach:**
  - In `pages/index.vue:71`: change `<div class="experiments-grid" role="list" aria-label="Experiments">` to `<ul class="experiments-grid" aria-label="Experiments">`. Wrap the `<ExperimentCard v-for=…>` in `<li :key="item.id"><ExperimentCard … /></li>` and move `:key` to the `<li>`.
  - In `ExperimentCard.vue:31`: drop `role="listitem"` from the `<a>`. No other change.
  - In `sections.css` `.experiments-grid` rule (line 178): add `list-style: none; margin: 0; padding: 0;` so the `<ul>` looks identical to the previous `<div>`.
- **Patterns to follow:** `consulting.vue:106` (`<ol class="entry-list" aria-label="…">`) + `ConsultingEntry.vue` rendering an `<li>`.
- **Test scenarios:**
  - **Visual diff (manual):** `/` renders the experiments grid identically — same gap, same border-top, no extra bullet markers.
  - **Keyboard tab order (manual):** Tab from the hero CTAs into the grid; focus lands on each card in the same order.
- **Verification:** `grep -rn 'role="list\b\|role="listitem"' app/` returns 0 hits; visual diff identical (browser test).

### U7. Vitest harness + 2 starter specs

- **Goal:** Establish a test harness and lock in two pieces of non-trivial behavior.
- **Requirements:** R7.
- **Dependencies:** U2 (shared `TyperConfig` lands first so the spec types are stable), U5 (`SiteNav.vue` has `lang="ts"`).
- **Files:**
  - `package.json` (modify — add devDeps + `"test"` script)
  - `vitest.config.ts` (new)
  - `tests/SiteNav.spec.ts` (new)
  - `tests/TypewriterHeadline.spec.ts` (new)
- **Approach:**
  - Add dev dependencies: `vitest`, `@vue/test-utils`, `happy-dom`, `@nuxt/test-utils`. Add script `"test": "vitest run"`.
  - `vitest.config.ts`: Vue + happy-dom environment + path alias for `~` → `app/`. Standard Nuxt 4 Vitest setup. No coverage threshold for this PR.
  - `tests/SiteNav.spec.ts`: mount with `vue-router` test stub; assert `links[0].href === '#work'` when `route.path === '/'`; assert `links[0].href === '/#work'` when `route.path === '/consulting'`. Implementer can either expose `links` via a wrapper composable or mount the component and read rendered `<a>` hrefs — implementer's call.
  - `tests/TypewriterHeadline.spec.ts`: stub `window.matchMedia` to return `{ matches: true }` for `(prefers-reduced-motion: reduce)`; mount the component; assert the `wordEl` text remains the SSR-rendered first word and no `setTimeout` is scheduled (e.g., via `vi.useFakeTimers()` + `vi.getTimerCount() === 0` after `nextTick`). Cancel/unmount cleanup is verified by `onBeforeUnmount` not throwing.
- **Patterns to follow:** standard Vitest 1.x + `@vue/test-utils` 2.x patterns. Reference `_process/` or existing project setup for path-alias usage if needed (no current test fixtures, so this unit establishes the convention).
- **Test scenarios:**
  - **U7-S1 (SiteNav spec):** `links[0].href` flips based on `route.path`. Specifically: on `/`, the experiments link is `#work`; on `/consulting`, it is `/#work`. Same flip pattern applies to the About link.
  - **U7-S2 (TypewriterHeadline reduced-motion):** when `matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`, the animation loop returns early — no `setTimeout` is scheduled (`vi.getTimerCount() === 0`), and the rendered word text equals `props.words[0]` (`'EXPERIMENTS'`).
- **Verification:** `npm run test` exits 0 with both specs passing; running `npm run typecheck && npm run lint && npm run test` locally is all-green.

### U8. (Folded) Documentation of formatter choice

Already covered by U1's `README.md` edit. Listed here only to make the requirements traceability tidy.

- **Requirements:** R8 (closed under U1).

---

## Requirements Traceability

| Req | Audit Dim | Implementation Unit |
|-----|-----------|---------------------|
| R1 — fix `/services` refs in README | Dim 1 | U1 |
| R2 — extract `TyperConfig` | Dim 3 | U2 |
| R3 — extract `padIndex` | Dim 4 | U3 |
| R4 — promote footer inline styles to classes | Dim 6 | U4 |
| R5 — `lang="ts"` in `SiteNav.vue` | Dim 7 | U5 |
| R6 — native `<ul><li>` for experiments grid | Dim 8 | U6 |
| R7 — Vitest harness + 2 starter specs | Dim 12 | U7 |
| R8 — document formatter choice | Dim 12 | U1 (with R1) |

---

## Commit Strategy

One commit per Implementation Unit (or per logical cluster). Suggested order — `U1 → U2 → U3 → U4 → U5 → U6 → U7`. Each commit message follows the project's conventional style: `refactor(<area>): <one-line summary> [PRO-95]`.

If U2 and U3 land in the same commit (both are tiny extract-to-new-file changes), that's fine — keep them in topical lockstep ("refactor(typer+utils): extract shared types and padIndex"). Otherwise keep them separate for cleaner history.

---

## Risks & Dependencies

- **R-Visual-Regression — Low.** U4 (footer styles) and U6 (grid `<ul>` swap) carry a visible-output risk. Mitigation: visual check in dev before commit; browser test in CI pipeline. Both changes are deliberately small and reversible.
- **R-Auto-import — Low.** U3 relies on Nuxt 4 auto-importing `app/utils/*`. The repo already auto-imports composables; `utils/` is the same mechanism. If a typecheck error appears, add an explicit import to the consumer.
- **R-Vitest-Nuxt-integration — Low/Med.** Setting up Vitest in a Nuxt 4 project usually requires `@nuxt/test-utils`. If `mount(SiteNav)` fails because Nuxt auto-imports (`useRoute`, `ref`, `onMounted`, etc.) aren't resolved in the test env, the implementer can either (a) use `@nuxt/test-utils/runtime` `mountSuspended`, or (b) test the `links` computed as an extracted pure function. Either path satisfies the spec.
- **R-CI-not-configured — N/A for this PR.** The audit asks "CI runs `typecheck && lint && test`". No CI workflow exists in the repo today. We add the `test` script; wiring a CI workflow is out of scope per Scope Boundaries.

---

## Verification Strategy

Before declaring done, run from the worktree root:

1. `npx nuxt prepare` — exits 0.
2. `npx nuxt typecheck` — exits 0.
3. `npm run lint` — exits 0.
4. `npm run test` — exits 0; both starter specs pass.
5. `grep -rn "/services" README.md 04-*.md docs/` — 0 hits.
6. `grep -rn "padStart" app/` — 1 hit (in `utils/format.ts`).
7. `grep -rn 'style="' app/components app/pages` — 1 hit (dynamic `:style` in `TypewriterHeadline.vue:128`).
8. `grep -rn 'role="list\b\|role="listitem"' app/` — 0 hits.
9. `grep -rL 'lang="ts"' app/components app/pages app/layouts` — 0 files.
10. Browser test (`ce-test-browser`): `/` and `/consulting` render with no visible diff vs. baseline; tab order in the experiments grid is unchanged.

---

## Out-of-Scope Annotation for PR Body

The PR description must call out:

- Pass-2 modernization items (scroll-state container query, scroll-driven nav border animation) are **deferred** per audit recommendation (Baseline-limited).
- "Noticed but not touched" items from the audit (placeholder hrefs, placeholder prices, `aria-current-value`, wrapper `<div>`s, scroll-margin nit) are deliberately **out of scope** for this PR.

---

*Generated by `ce-plan` from the PRO-95 ticket brief (`/tmp/cm-ticket-body.md`) and the nuxt-vue-quality v0.5 audit at `lab/skills-hatchery/claudiomendonca-com-audit.md`. Plan depth: Lightweight–Standard. No external research required — all findings are repo-internal consistency fixes.*
