# PRO-77 — Residual review findings

Run: ce-code-review autofix mode against plan docs/plans/PRO-77-home-page.md
Branch: feature/PRO-77-home-page
PR: https://github.com/claudioccm/claudiomendonca-com/pull/3
Date: 2026-05-21

No P0 / P1 findings. No safe_auto mutations applied — all residuals are
content / policy decisions that need a human.

---

## P2 — duplicate screenshot file (content)

`public/screenshots/squoosh.jpg` and `public/screenshots/varro.jpg` are
byte-identical (same SHA: `e1622ae2e6d9c381b77dfecbdf9c8dd7f8589c64`,
both 21,382 bytes, 924×540). Either the placeholder was copied across
both slots or one of them is the wrong file.

- file: public/screenshots/varro.jpg (or squoosh.jpg)
- owner: human (Claudio — content)
- suggested_fix: replace one of the two with the correct distinct
  screenshot for that product. If both are still placeholders, leave a
  note in `app/data/experiments.ts` next to the image path so it surfaces
  during PRO-78 / future content pass.

## P2 — explicit focus-visible styles not defined

No `:focus` / `:focus-visible` rules exist in `app/assets/css/{base,
chrome,sections}.css`. UA default focus rings are preserved (no
`outline: none` anywhere), so keyboard a11y is not broken — but `.btn`
carries a 1px border that can visually compete with the UA outline,
and the `.experiment` card has no border at all so the UA ring sits on
the link box, not the image. Plan check #9 ("focus styles preserved on
cards") is technically met by UA defaults; quality is borderline.

- files:
  - app/assets/css/sections.css  (`.btn`, `.experiment`)
- owner: downstream-resolver (style decision — defer to PRO-78 or a
  follow-up "focus pass" ticket)
- suggested_fix: add a single shared rule, e.g.
  ```css
  :focus-visible {
    outline: 2px solid var(--color-pitch-black);
    outline-offset: 3px;
  }
  ```
  in base.css, and verify against the Motto® reference if available.

## P3 — aria-label verbosity on cards

`ExperimentCard.vue` binds `aria-label` to the full `title`. For
`BATCH SQUOOSH` this is fine; the prototype used the terse `Squoosh`
in `aria-label` and `BATCH SQUOOSH` in the `<h3>`. Either approach is
defensible — flagging only because the prototype was different.

- file: app/components/ExperimentCard.vue:30
- owner: human (UX call)
- suggested_fix: if a terser label is preferred, add an optional
  `ariaLabel?: string` prop to `Experiment` and fall back to `title`
  when absent. Low priority.

## Informational — CSS line-range deltas vs plan comment

Plan claims ranges `.btn* 171–213`, `.hero* 275–326`,
`.section-head* 328–357`, `.bio-grid* 541–565`. Actual first-declaration
lines in `_process/prototype/styles.css` are 172, 276, 329, 542 (each
shifted by 1, because the plan included the closing comment line of
the preceding block). The selectors and substance match. No action
required — `app/assets/css/sections.css`'s own header comment is more
precise than the plan body.

---

Verdict: Ready with optional follow-ups. None of the above block merge.
