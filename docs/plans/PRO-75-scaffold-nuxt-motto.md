---
id: PRO-75
title: "feat: Scaffold Nuxt 4 + Motto design system"
type: feat
status: active
created: 2026-05-21
plan_depth: standard
worktree: experiments/claudiomendonca.com-wt/PRO-75
branch: feature/PRO-75-scaffold-nuxt-motto
origin_docs:
  - 01-brief.md
  - 02-design-system-motto.md
  - 03-directions.md
  - 04-services-page.md
  - _process/prototype/index.html
  - _process/prototype/styles.css
  - _process/prototype/tokens.css
---

# feat: Scaffold Nuxt 4 + Motto design system

## Summary

Initialize a Nuxt 4 project at the worktree root, wire in pnpm, install the minimal module set (`@nuxt/fonts`, `@nuxt/image`, `@nuxt/eslint`), port the Motto design tokens verbatim, and extract the foundational slices of the prototype stylesheet into a new `base.css`. End state: `pnpm dev` renders a near-empty page with Inter + Oswald (500) loaded, design tokens available as CSS variables, and the body shows the architectural blueprint grid plus the soft vignette overlay.

This is foundation-only. No components, no real pages, no `image-slot` logic, no nav/footer/hero markup, no product/services data. Those follow in later tickets.

---

## Problem Frame

The repository currently contains briefs (`01-brief.md` → `04-services-page.md`) and a static HTML/CSS prototype under `_process/prototype/`. There is no application. The next step is to stand up Nuxt 4 in a way that:

1. Honors the brief's tech-stack decisions (Nuxt 4, pnpm, `@nuxt/fonts` for Inter + Oswald 500, no UI kit, no Tailwind).
2. Brings the prototype's design system into the Nuxt project without rewriting it — `tokens.css` ports verbatim, and only the foundational, page-agnostic slices of `styles.css` move into `base.css`.
3. Leaves page-specific styling (nav, hero, work list, footer, buttons, section heads, bio grid, CTA banner, etc.) untouched in the prototype for later tickets to consume.
4. Produces a verifiable "Done when" — a running dev server showing fonts, tokens, blueprint grid, and vignette.

---

## Requirements

Traced from the PRO-75 ticket scope and `03-directions.md`:

- **R1.** Initialize Nuxt 4 at the worktree root using `nuxi init` with pnpm as the package manager.
- **R2.** Install `@nuxt/fonts`, `@nuxt/image`, and `@nuxt/eslint` as dev dependencies; register them in `nuxt.config.ts`.
- **R3.** Configure `@nuxt/fonts` to load **Inter** weight 500 only and **Oswald** weight 500 only — no other families, weights, or styles (`02-design-system-motto.md` §Typography).
- **R4.** Port `_process/prototype/tokens.css` **verbatim** to `app/assets/css/tokens.css`. Hex color format must be preserved — do not convert to oklch or hsl.
- **R5.** Create `app/assets/css/base.css` by extracting only the foundational slices from `_process/prototype/styles.css` (see Implementation Unit U4 for the exact slice list).
- **R6.** Register global CSS in `nuxt.config.ts` with `tokens.css` **before** `base.css` so token variables are defined when base styles consume them.
- **R7.** Provide a minimal `app/app.vue` (or `app/pages/index.vue`) sufficient to demonstrate that fonts, tokens, blueprint grid, and vignette load.
- **R8.** Configure `app.head` in `nuxt.config.ts` with title and viewport meta matching the prototype's `index.html` head.
- **R9.** `pnpm dev` runs without errors; visual check confirms: Inter renders body text, Oswald is available for `disp` utility, body shows the architectural blueprint grid, and the fixed vignette ellipse is visible.

Out-of-scope items are listed under Scope Boundaries.

---

## Scope Boundaries

### In scope
- Nuxt 4 project scaffold at worktree root.
- pnpm install + lockfile.
- Three modules: `@nuxt/fonts`, `@nuxt/image`, `@nuxt/eslint`.
- `nuxt.config.ts` (modules, fonts, css, app.head).
- `app/assets/css/tokens.css` (verbatim port).
- `app/assets/css/base.css` (six foundational slices extracted).
- Minimal demo page (`app/app.vue`).
- `.gitignore` adjustments only if `nuxi init` writes a conflicting one (the worktree already has a compatible `.gitignore`).

### Deferred to Follow-Up Work
The following are explicitly **not** part of PRO-75 and belong to later tickets:

- **Components.** No `AppNav`, `AppFooter`, `Hero`, `ExperimentCard`, etc.
- **Routes.** No `pages/index.vue` content beyond the bare demo, no `pages/services.vue`.
- **Layout.** No `layouts/default.vue` with shared chrome.
- **Page-specific CSS.** Everything in `styles.css` lines 108+ (nav, buttons, footer, hero, section-head, entry-list, experiments-grid, experiment-caption, entry, bio-grid, steps, cta-banner, outcomes, entry-rich) stays in the prototype, untouched, for later tickets.
- **`image-slot.js`.** Note the file exists at `_process/prototype/image-slot.js`; do not port, register, or reference it in this ticket.
- **Product / service data arrays.** No `data/products.ts`, no `data/services.ts`.
- **Copy.** No real hero headline, no product names, no blurbs.
- **Imagery.** No screenshots imported, no `@nuxt/image` usage beyond installing the module.
- **Lint config tuning.** Run `nuxi init` defaults for `@nuxt/eslint`; leave rule customization for a later pass.

### Outside this product's identity
- No dark mode (Motto is light-only by design — `02-design-system-motto.md`).
- No Tailwind, no UI kit, no design-token build step (CSS variables are the system).
- No analytics, CMS, backend, or data fetching.

---

## Key Technical Decisions

1. **Nuxt 4 with `app/` directory.** Nuxt 4 promotes the `app/` source directory by default (`app/app.vue`, `app/pages/`, `app/assets/`, `app/components/`). All new paths in this plan are repo-relative under `app/`. Confirmed by `nuxi init` defaults in Nuxt 4.
2. **pnpm everywhere.** `corepack`-style pnpm is the user's standard. `nuxi init` accepts `--package-manager pnpm` to skip the prompt.
3. **Hex colors preserved.** `tokens.css` is copied byte-for-byte. The user-global CLAUDE.md is explicit: never mix oklch and hsl, and check the existing format first. The prototype uses hex, so the port uses hex.
4. **CSS order matters.** `nuxt.config.ts` `css: []` array honors order. `tokens.css` must be listed first so `:root` variables are defined before any rule in `base.css` references them.
5. **Fonts via `@nuxt/fonts`, not `<link>`.** `03-directions.md` allows either; the ticket specifies `@nuxt/fonts`. Configure with exact weights to avoid the module pulling extra variants. The prototype's `<link>` to Google Fonts in `index.html` is replaced by the module — do not also add a `<link>` in `app.head`.
6. **One demo page via `app/app.vue`.** Simpler than a layout + page split for a foundation ticket. `app/app.vue` renders directly without `pages/`; we add a single line of body text and a `disp` utility span so both fonts are exercised.
7. **`@nuxt/image` is installed but unused.** The ticket requires installing it; using it is out of scope. Registering the module is a no-op without `<NuxtImg>` usage and keeps the install side-effect-free.
8. **`@nuxt/eslint` defaults only.** Adopt the module's stock config; do not author a custom `eslint.config.mjs` in this ticket.

---

## High-Level Technical Design

*Directional guidance for review — the implementing agent should treat this as context, not code to reproduce.*

### File tree after PRO-75

```
experiments/claudiomendonca.com-wt/PRO-75/
├── .gitignore                          # already present, compatible
├── 01-brief.md … 04-services-page.md   # untouched
├── _process/                           # untouched
├── README.md                           # untouched
├── docs/
│   └── plans/
│       └── PRO-75-scaffold-nuxt-motto.md   # this plan
├── nuxt.config.ts                      # NEW — modules, fonts, css, app.head
├── package.json                        # NEW — from nuxi init, deps added
├── pnpm-lock.yaml                      # NEW — from pnpm install
├── tsconfig.json                       # NEW — from nuxi init
├── eslint.config.mjs                   # NEW — from @nuxt/eslint default
├── app/
│   ├── app.vue                         # NEW — minimal demo
│   └── assets/
│       └── css/
│           ├── tokens.css              # NEW — verbatim from prototype
│           └── base.css                # NEW — extracted foundational slices
└── public/                             # NEW — from nuxi init (favicon etc.)
```

### CSS load order at runtime

```
1. tokens.css        ← :root { --color-pitch-black: #000; ... }
2. base.css          ← references vars from step 1
3. component CSS     ← (none in this ticket; future)
```

---

## Implementation Units

### U1. Initialize Nuxt 4 project with pnpm

**Goal:** Create a Nuxt 4 project at the worktree root using `nuxi init`, with pnpm as the package manager. Produces `package.json`, `tsconfig.json`, `nuxt.config.ts`, `app/app.vue`, `public/`, and a `node_modules/` after install.

**Requirements:** R1.

**Dependencies:** none.

**Files (created by `nuxi init`):**
- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.json`
- `nuxt.config.ts`
- `app/app.vue`
- `public/favicon.ico` (or similar)
- `.gitignore` — if `nuxi init` writes one and the existing worktree `.gitignore` is compatible, keep the existing one; otherwise merge

**Approach:**
- Run `nuxi init` in the worktree root targeting the current directory (`.`). Pass flags to select pnpm and skip the git-init prompt (the worktree is already a git checkout).
- Recommended invocation shape (the implementer should use the exact flag names matching the installed `nuxi` version): `pnpm dlx nuxi@latest init . --package-manager pnpm --no-git-init` — or the prompt-driven equivalent if a flag changes between Nuxi versions.
- Verify Nuxt 4 was installed (check `package.json` `nuxt` version starts with `^4.`). If `nuxi init` defaults to Nuxt 3 in the installed CLI version, bump `nuxt` to `^4` and re-run `pnpm install`.
- Confirm the `app/` directory is present after init. Nuxt 4 scaffolds this by default; if it does not appear, the version is wrong.
- Do not switch branches. Do not commit yet.

**Patterns to follow:**
- Worktree's existing `.gitignore` already covers `node_modules`, `.nuxt`, `.output`, `.data`, `.cache`, `.env*`, `dist`, `.DS_Store`. If `nuxi init` writes a different `.gitignore`, preserve the worktree's existing entries.

**Test scenarios:** Test expectation: none — pure scaffolding, no behavior to assert at unit level. Verification happens at U6.

**Verification:**
- `package.json` exists and `nuxt` is `^4.x.x`.
- `app/app.vue` exists.
- `nuxt.config.ts` exists with an empty `defineNuxtConfig({})`.
- `pnpm dev` (without further config) boots without error (smoke check before adding modules).

---

### U2. Install and register modules: `@nuxt/fonts`, `@nuxt/image`, `@nuxt/eslint`

**Goal:** Add the three required modules as dev dependencies and register them in `nuxt.config.ts`.

**Requirements:** R2.

**Dependencies:** U1.

**Files:**
- `package.json` (modified — devDependencies added)
- `pnpm-lock.yaml` (modified)
- `nuxt.config.ts` (modified — `modules: [...]`)
- `eslint.config.mjs` (created — by `@nuxt/eslint` default; may require `pnpm dlx @nuxt/eslint` or be generated on first dev run)

**Approach:**
- Install as devDependencies in a single command: `pnpm add -D @nuxt/fonts @nuxt/image @nuxt/eslint`.
- Add to `nuxt.config.ts` `modules` array in this order: `'@nuxt/fonts'`, `'@nuxt/image'`, `'@nuxt/eslint'`. Order is not load-order-sensitive among these three but keeping it stable aids readability.
- Let `@nuxt/eslint` generate its config on first dev run. If the module documents an explicit `eslint.config.mjs` scaffold step, run it; otherwise accept the default.
- Do not configure `@nuxt/image` providers in this ticket — module presence only.
- Do not yet configure `@nuxt/fonts` — that is U3.

**Patterns to follow:**
- Nuxt module registration uses string identifiers in the `modules` array; this matches the Nuxt 4 documentation pattern.

**Test scenarios:** Test expectation: none — install + register, no behavior change yet.

**Verification:**
- `pnpm list @nuxt/fonts @nuxt/image @nuxt/eslint` shows all three installed.
- `pnpm dev` boots without errors; module banners for all three appear in the dev console.

---

### U3. Configure `nuxt.config.ts` — fonts, css, app.head

**Goal:** Wire `@nuxt/fonts` to load Inter 500 and Oswald 500 only; register `tokens.css` and `base.css` as global CSS in the correct order; set app head meta.

**Requirements:** R3, R6, R8.

**Dependencies:** U2. (U4 and U5 create the CSS files this unit references; ordering between U3, U4, U5 is flexible — the plan executes them sequentially U3 → U4 → U5 → U6, but a working `pnpm dev` requires all three before U6.)

**Files:**
- `nuxt.config.ts` (modified)

**Approach (config shape, not code):**

The `nuxt.config.ts` should declare, at minimum:

- `modules`: `['@nuxt/fonts', '@nuxt/image', '@nuxt/eslint']` (from U2).
- `css`: an array with **`'~/assets/css/tokens.css'` first**, then `'~/assets/css/base.css'`. Order is load-order-significant — see Key Technical Decision 4. (Note: in Nuxt 4, `~` resolves to the `app/` directory, so `~/assets/css/...` points to `app/assets/css/...`.)
- `fonts`: configure the `@nuxt/fonts` module with two families:
  - **Inter**, weights `[500]`, styles `['normal']`.
  - **Oswald**, weights `[500]`, styles `['normal']`.
  - Provider precedence per module defaults (Google Fonts is fine; Bunny/local are acceptable equivalents). No subsetting customization needed.
  - Do not include any other weights, italic variants, or fallback families in the module config — fallback stacks live in `tokens.css` via `--font-sans` and `--font-disp`.
- `app.head`:
  - `title`: `"Claudio Mendonça — AI Experiments"` (matches prototype `index.html` line 6).
  - `meta`: include `[{ name: 'viewport', content: 'width=device-width, initial-scale=1' }, { name: 'description', content: 'Personal site of Claudio Mendonça. AI experiments and client services.' }]` (matches prototype line 7).
  - `htmlAttrs`: `{ lang: 'en' }`.
  - Do **not** add `<link>` tags for Google Fonts — `@nuxt/fonts` handles this.
- `compatibilityDate`: a recent date (e.g. `'2026-05-21'`) as Nuxt 4 expects.

**Patterns to follow:**
- `@nuxt/fonts` module docs (current as of Nuxt 4). The implementing agent should consult the live module README for the exact `fonts` config key shape since the schema has evolved across module versions. If the schema differs from the description above, honor the constraint (Inter 500 only, Oswald 500 only) rather than the exact key names sketched here.

**Test scenarios:** Test expectation: none — pure configuration. Behavior is verified end-to-end at U6.

**Verification:**
- `pnpm dev` boots; no warnings about unknown CSS files or font configs.
- Dev server HTML response includes a `<title>Claudio Mendonça — AI Experiments</title>`.
- DevTools Network tab shows exactly **one Inter 500 font file** and **one Oswald 500 font file** loaded — no extra weights.
- Computed style on `<body>` resolves `--color-pitch-black` to `#000000` (tokens loaded).

---

### U4. Port `tokens.css` verbatim to `app/assets/css/tokens.css`

**Goal:** Copy `_process/prototype/tokens.css` byte-for-byte to `app/assets/css/tokens.css`. No edits, no reformatting, no color-format conversion.

**Requirements:** R4.

**Dependencies:** U1 (`app/` directory must exist).

**Files:**
- `app/assets/css/tokens.css` (created)

**Approach:**
- `cp _process/prototype/tokens.css app/assets/css/tokens.css` (or equivalent file-write of the same content).
- Verify the resulting file matches the source. The expected file is 49 lines, declares `:root { ... }`, uses hex color format throughout (`#000000`, `#ffffff`, `#1b1b1c`, etc.), and includes the page-level tokens `--page-max: 1280px` and `--page-pad-x: clamp(20px, 5vw, 96px)`.
- Do **not** convert hex to oklch, hsl, or any other format. User-global CLAUDE.md is explicit on this.
- Do **not** reorder properties or rename custom property names.

**Patterns to follow:**
- The source file is the canonical definition derived from `02-design-system-motto.md` §"Quick start — CSS custom properties". Both must stay in sync; this ticket keeps them in sync by copying.

**Test scenarios:** Test expectation: none — pure asset copy. Verified at U6 via computed-style check.

**Verification:**
- `diff _process/prototype/tokens.css app/assets/css/tokens.css` returns no differences.
- File is referenced by `nuxt.config.ts` `css[0]` (from U3).

---

### U5. Create `app/assets/css/base.css` from prototype slices

**Goal:** Extract the foundational, page-agnostic slices of `_process/prototype/styles.css` into a new `app/assets/css/base.css`. Page-specific styles (nav, hero, work list, footer, buttons, section-head, entries, bio, steps, CTA banner, outcomes) stay in the prototype and are out of scope for this ticket.

**Requirements:** R5.

**Dependencies:** U1 (`app/` directory must exist), U4 (tokens must be available so base.css references resolve).

**Files:**
- `app/assets/css/base.css` (created)

**Approach — extract these slices, in this order, from `_process/prototype/styles.css`:**

| # | Slice | Source lines | Selectors / rules |
|---|---|---|---|
| 1 | Reset / box-sizing / font-smoothing | 3–5 | `*, *::before, *::after { box-sizing: border-box }`, `html { font-smoothing }` |
| 2 | `html, body` base typography | 7–16 | margin/padding 0, background `--color-canvas-white`, color `--color-pitch-black`, `--font-sans`, `--font-weight-medium`, body size + leading, `scroll-behavior: smooth` |
| 3 | Blueprint grid body background | 18–39 | The `body { background-image: ..., background-size: ... }` block with the 64px / 16px grids and dot field |
| 4 | Vignette overlay | 41–50 | `body::before` with the `radial-gradient` ellipse, fixed position, `inset: 0`, `pointer-events: none`, `z-index: 0` |
| 5 | Reduced-motion override | 55–57 | `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }` |
| 6 | `img, svg` reset | 59 | `img, svg { display: block; max-width: 100% }` |
| 7 | Base `a` reset + `.link-underline` utility | 61–70 | `a { color: inherit; text-decoration: none }` and `a.link-underline` |
| 8 | `::selection` | 73 | Inverts to pitch-black background, canvas-white text |
| 9 | Type utilities | 75–84 | `.disp`, `.sans`, `.t-caption`, `.t-body`, `.t-sub`, `.t-h-sm`, `.t-h`, `.t-h-lg` |
| 10 | Color utilities | 86–88 | `.ash`, `.silver`, `.faint` |
| 11 | `.shell` layout container | 91–96 | max-width, auto margin, `--page-pad-x` horizontal padding |
| 12 | `main` display + section rhythm | 98–106 | `main { display: block }`, `section { padding clamp; position: relative }`, `section + section { border-top: 1px solid --color-stone-accent }` |
| 13 | `.todo` marker | 567–580 | The TODO pill (monospace, faint gray, stone-accent border) |

**Also include** the small `.nav, main, .footer { position: relative; z-index: 1 }` rule from line 53 — it's the companion to the vignette overlay and ensures content sits above the `::before` layer. Note: in this ticket only `main` exists; the `.nav` and `.footer` selectors are no-ops until later tickets add those elements, which is intentional and harmless.

**Do NOT include** (these stay in the prototype for later tickets):
- `.nav`, `.nav-inner`, `.wordmark`, `.nav-links`, and the `@media (max-width: 640px)` nav rules (styles.css ~108–169).
- `.btn` family — `.btn`, `.btn-filled`, `.btn-ghost`, `.btn-arrow`, `.btn-text` (~171–225).
- `.footer` family (~227–273).
- `.hero` family (~275–326).
- `.section-head` (~328–357).
- `.entry-list`, `.experiments-grid`, `.experiment`, `.experiment-caption`, `.entry`, `.entry.entry-rich` (~359–539, 669–676).
- `.bio-grid` (~541–565).
- `.steps`, `.step` (~582–616).
- `.cta-banner` (~618–644).
- `.outcomes` (~646–667).

**Patterns to follow:**
- Use the prototype's exact CSS — same property values, same selectors, same comments where they aid future readers. The goal is a clean transplant, not a rewrite.
- Keep `/* ---------- Section ---------- */` comment dividers from the prototype where they bracket the kept slices, so the file remains easy to scan.

**Test scenarios:** Test expectation: none for the file itself (no JS behavior to test). Behavioral verification happens in the browser at U6:
- Body background renders the architectural grid (visible at any zoom).
- A fixed-position lighter ellipse overlay (vignette) is visible behind content.
- A `<span class="disp">` element renders in Oswald uppercase; a plain `<p>` renders in Inter.
- A `<span class="todo">TODO</span>` renders as the monospace pill with stone-accent border.

**Verification:**
- File exists at `app/assets/css/base.css`.
- File contains no references to selectors listed in the "Do NOT include" block above (`.nav`, `.btn*`, `.footer`, `.hero`, `.section-head`, `.entry*`, `.experiment*`, `.bio-grid`, `.steps`, `.cta-banner`, `.outcomes`).
- Visual checks under U6 pass.

---

### U6. Minimal `app/app.vue` demo + end-to-end verification

**Goal:** Replace the `nuxi init` default `app/app.vue` with a minimal markup sample that exercises both fonts, both core utilities, and the `.todo` marker — proving the "Done when" criteria.

**Requirements:** R7, R9.

**Dependencies:** U3, U4, U5.

**Files:**
- `app/app.vue` (modified — overwrites nuxi init default)

**Approach (template shape, not code):**

The template should contain, inside a single `<main class="shell">` wrapper so the layout container is exercised:

- A `<section>` with:
  - A `<p class="t-caption ash">` line — exercises caption type util + ash color util + Inter body font.
  - An `<h1 class="disp t-h-lg">` line reading something neutral like `"AI EXPERIMENTS"` (matches the prototype's hero placeholder, no real copy decision encoded) — exercises Oswald, `disp` letter-spacing/uppercase, and the `t-h-lg` size util.
  - A `<p class="t-body">` line of body copy.
  - A `<span class="todo">TODO</span>` to verify the marker pill renders.

No `<style>` block in `app.vue` — global CSS from `tokens.css` + `base.css` is sufficient.

No `<NuxtPage />` (the project has no `pages/` directory yet in this ticket; future tickets add it).

**Patterns to follow:**
- Mirror the prototype's class composition style: utility classes on elements, no inline styles.

**Test scenarios:** Test expectation: none in code (no Vitest/Playwright in this ticket). Manual verification below covers the "Done when" line in the ticket.

**Verification — mapped 1:1 to the ticket's "Done when":**

| "Done when" criterion | Verification step |
|---|---|
| `pnpm dev` renders an empty page | Run `pnpm dev`; open the dev URL; page loads with HTTP 200, no console errors, no module-resolution errors |
| with Motto fonts | DevTools → Computed → `<p class="t-body">` shows `font-family: Inter, Arial, Helvetica, sans-serif`; `<h1 class="disp">` shows `font-family: Oswald, Impact, sans-serif`. Network tab shows exactly one Inter 500 file and one Oswald 500 file loaded |
| tokens loaded | DevTools → Computed → `:root` shows `--color-pitch-black: #000000`, `--text-body: 17px`, `--page-max: 1280px`, etc. (any 2–3 spot checks across colors/type/spacing/page) |
| body shows blueprint grid | Visual: 64px major grid + 16px minor grid + dot intersections visible across the page background |
| + vignette | Visual: a soft white ellipse glow at roughly 50% horizontal / 40% vertical fades the grid toward the page center; remains fixed when scrolling |

If all five rows pass, PRO-75 is done.

---

## System-Wide Impact

- **First code in the repo.** No existing imports, components, or routes to update.
- **Future tickets depend on this.** Component tickets will register page-specific CSS, add `app/components/`, `app/pages/`, `app/layouts/`, and a product data module. The base set up here — token order, CSS load order, font module config, `.shell`/`section` rhythm — is the foundation those tickets build on.
- **Prototype stays the reference.** `_process/prototype/` remains the visual source of truth until each page-specific slice is migrated in its own ticket. Do not delete or modify the prototype in this ticket.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| `nuxi init` defaults to Nuxt 3 in the installed CLI version | After init, check `package.json`; bump to `^4` and rerun `pnpm install` if needed |
| `@nuxt/fonts` schema differs from the sketch in U3 | Implementer consults the live `@nuxt/fonts` README and honors the constraint (Inter 500 only, Oswald 500 only) rather than the exact key shape |
| `nuxi init` writes a `.gitignore` that conflicts with the worktree's existing one | Diff before accepting; preserve the worktree's `todos/_resolved/` and any lfg-tracked entries |
| Order of `css[]` flipped (base.css before tokens.css) | base.css would still parse but all `var()` lookups would resolve to invalid initial values — visual would be completely broken. Easy to spot during U6 verification |
| `@nuxt/image` requires a provider on dev server start | If the module errors without a configured provider, fall back to setting `image: { provider: 'none' }` or the minimal `ipx` default. The module should boot with defaults — only intervene if dev startup actually fails |
| Hex vs oklch drift introduced during the copy | U4 verification step is a `diff` against the source; this catches any byte-level change |

---

## Verification Summary

The "Done when" check from the ticket is the single source of truth for completion:

> `pnpm dev` renders empty page with Motto fonts, tokens loaded, body shows blueprint grid + vignette.

Mapped to concrete checks (see U6 table). When the five rows in that table all pass, PRO-75 ships.

---

## Open Questions / Notes for the Implementer

1. **Exact `@nuxt/fonts` config key shape** — the module's options object has changed across minor versions. The plan specifies the constraint (Inter 500 only, Oswald 500 only, no italic, no other families); the implementer picks the exact key names from the installed version's README.
2. **`nuxi init` flag names** — `--package-manager pnpm` and `--no-git-init` are typical, but flag spelling has shifted between Nuxi releases. If a flag is rejected, fall back to the interactive prompt and answer pnpm + skip git.
3. **First demo headline copy** — the plan uses `"AI EXPERIMENTS"` as neutral placeholder text mirroring the prototype. This is not a copy decision; later tickets will choose real hero copy.
4. **ESLint config customization** — out of scope for this ticket. Use stock `@nuxt/eslint` defaults; tune later if/when lint output gets noisy.
