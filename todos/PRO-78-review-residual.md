# PRO-78 — Residual code-review findings

Source: `ce-code-review` autofix run against PR #5 (https://github.com/claudioccm/claudiomendonca-com/pull/5).
Run artifact: `/tmp/compound-engineering/ce-code-review/20260521-134244-282d5819/`
Plan: `docs/plans/PRO-78-consulting-page.md`

`safe_auto` fixes (1) were applied in-place and pushed in `aadae0d`. The
items below are the remaining `gated_auto` / `advisory` findings that the
autofixer left for human / next-step resolution.

---

## 1. [P2 — gated_auto] Inline `style="margin-top: 48px;"` on two `.t-caption faint` paragraphs

**Files / lines.**
- `app/components/HowItWorks.vue:48`
- `app/pages/consulting.vue:83`

**Issue.** Two consumers now repeat the same one-off margin via inline
`style`. The plan's Open Questions section anticipated this and noted
"a 5-minute follow-up could promote it" once a second consumer appears
(which is now the case).

**Why it matters.** Inline styles in a Motto® stack that otherwise lives
entirely in global stylesheets break the convention. The pattern also
becomes a copy-paste hazard if a third trailing caption is added later.

**Suggested fix.** Introduce a `.section-trail` (or
`.t-caption.section-trail`) rule in `app/assets/css/sections.css` carrying
`margin-top: clamp(32px, 4vw, 48px);` (the responsive form is a small
improvement over the fixed 48px), then strip the inline style from both
sites. One CSS rule, two markup edits, zero behavior change at desktop.

**Why not auto-applied.** Touches the public class API (new selector) —
the autofixer doesn't pick class names. Wants a human to confirm the
name and decide whether to promote the value to a clamp.

---

## 2. [P3 — advisory] Hero down-arrow `aria-label="Scroll to work"` is wrong on /consulting

**File / line.** `app/components/HeroSection.vue:36` (consumed by
`app/pages/consulting.vue:20`).

**Issue.** On `/consulting`, `HeroSection`'s down-arrow targets
`#consulting` but the hard-coded `aria-label` still says "Scroll to work."
Screen-reader users hear an incorrect destination.

**Why it matters.** Minor a11y polish. The visible arrow link works
correctly; only the SR label is wrong.

**Suggested fix.** Add a `downArrowLabel?: string` prop to
`HeroSection.vue` defaulting to `'Scroll to work'`, then pass
`down-arrow-label="Scroll to offerings"` from `consulting.vue`.

**Why not auto-applied.** Plan explicitly defers this to a future cleanup
ticket (Scope Boundaries → Deferred, Risk #6, K6). The fix changes the
`HeroSection` API surface (new prop), which crosses PRO-78's scope
boundary. Leaving it for a follow-up keeps PRO-78 focused. Pre-existing
in PRO-77's `HeroSection.vue`.

---

## 3. [P3 — advisory] Hero `<h1>` uses `<br>` markup mid-sentence

**File / line.** `app/pages/consulting.vue:26`.

**Issue.** `<h1>Ship AI that<br>actually works.</h1>` — assistive
technologies may treat the `<br>` as a sentence boundary, reading the
heading as two separate utterances.

**Why it matters.** Standard practice for display-type line breaks. The
prototype carries the same `<br>`, so this is a content-fidelity choice.
Not a regression.

**Suggested fix.** Optional. If desired, replace the `<br>` with a
non-breaking-space `&nbsp;` or rely on CSS `text-wrap: balance` once
browser support is universal. None of these are clearly better than the
current shape for the Motto® display-type rendering.

**Why not auto-applied.** Advisory — the existing markup matches the
prototype and the plan does not flag this as a regression. Document
choice, not a bug.

---

## Summary

- Findings (post-autofix): **0 P0, 0 P1, 1 P2, 2 P3.**
- `safe_auto` fixes applied in-place: **1** (`:key="i"` on the outcomes
  v-for in `ConsultingEntry.vue`, commit `aadae0d`).
- Lint / typecheck / build: **green** after autofix.
- Acceptance criteria (R1–R16, AC1–AC6) against the plan: **met.**

Verdict: **Ready with fixes** — the one P2 (promote inline margin to a
class) should land before merge to stay aligned with the Motto® "no
inline styles" convention; the two P3 advisories are deferred per plan.
