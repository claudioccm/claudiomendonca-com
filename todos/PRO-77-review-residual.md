# PRO-77 — Residual review findings

Run: ce-code-review autofix mode against plan docs/plans/PRO-77-home-page.md
Branch: feature/PRO-77-home-page
PR: https://github.com/claudioccm/claudiomendonca-com/pull/3
Date: 2026-05-21
Resolved: 2026-05-21

No P0 / P1 findings. No safe_auto mutations applied — all residuals were
content / policy decisions that needed a human.

Status: **all three findings resolved (or explicitly deferred with a tracked TODO)**.

---

## P2 — duplicate screenshot file (content) — RESOLVED (won't fix in this ticket)

`public/screenshots/squoosh.jpg` and `public/screenshots/varro.jpg` are
byte-identical (same SHA: `e1622ae2e6d9c381b77dfecbdf9c8dd7f8589c64`,
both 21,382 bytes, 924×540). This is faithful to the prototype, whose
`home-grid-captions.png` and `home-grid-v2.png` are themselves byte-
identical placeholder bitmaps.

- file: public/screenshots/varro.jpg (or squoosh.jpg)
- owner: human (Claudio — content)
- resolution: **won't fix in this ticket**. Real product screenshots for
  Squoosh and Varro (and the rest of the grid) are out-of-scope for
  PRO-77. The `app/data/experiments.ts` file already carries
  `TODO(claudio)` markers tracking placeholder status; a top-of-file
  comment was added in this resolution pass to make the placeholder
  state explicit. The work will be picked up in a future content pass
  (PRO-78 or a dedicated screenshots ticket).
- commit: see scoped commit for the experiments.ts comment update.

## P2 — explicit focus-visible styles not defined — RESOLVED

Added an explicit `:focus-visible` ring to `.experiment` in
`app/assets/css/sections.css`, scoped to the card anchor rather than a
global rule so it can't fight existing UA defaults elsewhere on the page:

```css
.experiment:focus-visible {
  outline: 2px solid var(--color-pitch-black);
  outline-offset: 4px;
}
```

- file: app/assets/css/sections.css (right after the `.experiment` block)
- verification: `pnpm dev` + tab through grid; rule confirmed shipped in
  the dev-served stylesheet (curl'd `/_nuxt/assets/css/sections.css`).
  Mouse users see no ring (the `:focus-visible` pseudo-class only matches
  keyboard / non-pointer focus). Reduced-motion override unchanged.

## P3 — aria-label verbosity on cards — RESOLVED

Added an optional `ariaLabel?: string` field to the `Experiment`
interface in `app/data/experiments.ts`, and an optional
`ariaLabel?: string` prop on `ExperimentCard.vue`. `ExperimentCard` now
binds `aria-label` to `ariaLabel ?? title`, so:

- Cards whose visible title is already terse fall through to `title`
  unchanged (Cut The Crap, Edge, Varro).
- The BATCH SQUOOSH card overrides with `ariaLabel: 'Squoosh'`, matching
  the prototype's terse spoken name while keeping the loud visible
  `<h3>BATCH SQUOOSH</h3>`.

- files:
  - app/data/experiments.ts (interface + Squoosh entry)
  - app/components/ExperimentCard.vue (prop + computed accessible name)
  - app/pages/index.vue (pass-through binding)
- verification: SSR-rendered HTML inspected via curl — aria-labels are
  `"Cut The Crap"`, `"Edge"`, `"Squoosh"`, `"Varro"`, matching the
  prototype exactly.

## Informational — CSS line-range deltas vs plan comment — NO ACTION

Unchanged from original report. The selectors and substance match the
prototype; only the line numbers in the plan body are off by one
because they include the closing comment line of the preceding block.
`app/assets/css/sections.css`'s own header comment is already precise.

---

Verdict: all P2 / P3 review residuals are addressed in code, with the
one content-only finding explicitly deferred and tracked in
`app/data/experiments.ts`. PR-3 unblocked for merge.
