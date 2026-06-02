# PRO-91 — Code-review residual items

Plan: `docs/plans/PRO-91-realign-consulting-copy.md`
Brief: `docs/plans/PRO-91-source-brief.md`
Branch: `feature/PRO-91-consulting-strategy-copy`
PR: https://github.com/claudioccm/claudiomendonca-com/pull/8 (base `dev`)
Date: 2026-06-02

Code review of the PRO-91 copy + data realignment. The implementation is faithful
to the brief: every price renders literally `9999,00`, the MIT stat is verbatim and
correctly attributed, all stale strings are gone ("Ship AI that actually works",
"Pricing intentionally not shown", "Agent Architecture", "AI Training", "operating it
without me", "enablement", old home pointer), the "Offerings — 03" label matches the
3-card count, section order is correct, no curly quotes, and build / lint / typecheck
are all green. No P1 or P2 issues found. No safe auto-fixes were needed (no typos, no
lint errors, no broken markup).

The items below are judgment-dependent (P3) and were intentionally NOT changed —
they need owner / design sign-off, not a mechanical fix.

---

## 1. [P3] Audit card title carries a `<br>` the brief did not specify — RESOLVED (fixed)

**Decision (2026-06-02).** Removed the `<br />`. `consulting.ts` line 29 now reads
`title: 'Opportunity Audit.'`. Rationale: the brief deliberately distinguishes §01 (no
break) from §02/§03 (with break), and Plan U1 says "match the brief's exact break
points." The explicit brief spec outranks the visual-parallelism argument; "Opportunity
Audit." is short enough to sit on one logical line and still wraps naturally in display
type. Data-layer header comment softened to note titles break only where the brief
specifies. Verified via `pnpm build` + `pnpm lint` (both green).

**File / line.** `app/data/consulting.ts:29` — `title: 'Opportunity<br />Audit.'`

**Finding.** The brief's offering headers specify line breaks explicitly: §02 is
`Automate the<br>repetitive.` and §03 is `Empower<br>your team.`, but §01 is
`Opportunity Audit.` with **no** `<br>`. The implementation added a break
(`Opportunity<br />Audit.`) so the Audit title wraps to two display-type lines like
the other two cards. Plan U1 says "match the brief's exact break points," so this is a
minor deviation.

**Why not auto-fixed.** Removing the `<br>` is a display-type wrapping judgment, not a
correctness fix. The two-line treatment parallels the other cards and the existing
`Agent<br />Architecture.` convention, and may read better than one long line. Needs a
visual / owner call.

**Resolution (if owner wants brief-exact).** Change line 29 to
`title: 'Opportunity Audit.'` and confirm it wraps acceptably in Motto display type at
mobile widths.

---

## 2. [P3] DIY-counter H2 "Not just a chatbot." is author-added (not in brief) — RESOLVED (accept as-is)

**Decision (2026-06-02).** Kept "Not just a chatbot." No change. Rationale: the reused
`.bio-grid` primitive structurally requires an h2 (same as the "The brief." block above),
so the block needs *a* heading and the brief supplied none — this isn't a deviation from a
spec, it's filling a gap the brief left. The wording is short, on-message, and directly
echoes the strategy's #1 objection ("we'll just use ChatGPT ourselves"). The brief's
alternative phrasing "This isn't 'just use ChatGPT'" is wordier and puts a brand name in a
display heading; the current line is the lighter, cleaner touch. No structural change.

**File / line.** `app/pages/consulting.vue:78` — `<h2>Not just a chatbot.</h2>`

**Finding.** The brief gives this block an H3/label of "The honest version" and refers
to it informally as "This isn't 'just use ChatGPT'", but specifies no H2. The
implementation keeps the "The honest version" label and authors a new H2,
"Not just a chatbot." (needed because the reused `.bio-grid` primitive expects an h2).
The wording is on-message but is net-new copy, not from the brief.

**Why not auto-fixed.** It's a headline-copy decision, not an error. "Not just a
chatbot." is consistent with the strategy's DIY-counter intent. Flagged only so the
owner can confirm the exact heading wording during the voice gut-check.

**Resolution.** Owner confirms or swaps the H2 wording (e.g. to echo the brief's
"This isn't 'just use ChatGPT'"). No structural change either way.

---

## 3. [P3] Pre-existing heading-level skip in HowItWorks (h2 → h4), unchanged — DEFERRED (out of PRO-91 scope)

**Decision (2026-06-02).** Deferred to a separate ticket. Not touched. Rationale: the
`<h4>` step markup predates PRO-91 and is outside this ticket's copy/data scope. PRO-91
changed only the step *text*, not heading levels, so this is not a regression introduced by
this PR. Fixing it would require updating the three step `<h4>` → `<h3>` plus the matching
`.step h4` CSS selectors across every page that uses the component — broader than this
ticket. Recorded here for follow-up.

**File / line.** `app/components/HowItWorks.vue:22,30,39` — step titles are `<h4>`
under the section's `<h2>How it works.</h2>` (skips h3).

**Finding.** On `/consulting` the rendered heading sequence is
h1 → h2 → h2 → h2 → h3×3 (offerings) → h2 (how it works) → **h4×3** (steps) → h2
(pricing) → h2 (CTA). The how-it-works steps jump from h2 to h4, skipping h3 — a
minor a11y heading-order nit.

**Why not auto-fixed.** This is **pre-existing** (the `<h4>` step markup predates
PRO-91 and is outside this ticket's copy/data scope). PRO-91 only changed the step
*text*, not the heading levels. Not a regression introduced by this PR.

**Resolution (separate ticket).** If addressed, change the three step `<h4>` to `<h3>`
in `HowItWorks.vue` and verify `.step h4` CSS selectors are updated to match, across
all pages that use the component.

---

## Verified clean (no action)

- All four price lines render literally `9999,00` (`9999,00`, `from 9999,00`,
  `9999,00`, `9999,00 / month`); no real figures leaked into the source or the
  prerendered `/consulting` HTML.
- MIT stat verbatim and attributed to "MIT, *State of AI in Business 2025*"; no
  fabricated client / proof metric (Shorenstein slot correctly deferred).
- No stale strings anywhere under `app/`.
- "Offerings — 03" label == 3 `consultingOfferings` entries.
- `v-html` on the offering title stays repo-controlled (static module) with the
  `eslint-disable-next-line vue/no-v-html` comment intact — no XSS surface.
- All new CSS tokens (`--color-pitch-black`, `--color-ash-text`, `--text-caption`,
  `--text-body`, `--leading-body`, `--font-disp`, `--font-sans`,
  `--font-weight-medium`) are defined; new `.price-list` / `.price-row` /
  `.stat-callout` collapse to single column at the shared `max-width: 800px`
  breakpoint and reuse the existing hairline-rule convention. Site has no dark mode
  (no `prefers-color-scheme` / `.dark` / `data-theme`), so the single-theme color
  usage matches every existing section — no theme regression.
- Straight quotes throughout the changed copy; em-dashes are consistent with existing
  repo style (eyebrows, body copy).
- Section order: hero → The brief → DIY counter → offerings (3) → how it works →
  pricing → CTA.
- `pnpm build`, `pnpm lint`, `pnpm typecheck` all pass.
