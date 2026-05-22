# PRO-79 — Residual code-review findings

Source: `ce-code-review` autofix run against PR #6 (https://github.com/claudioccm/claudiomendonca-com/pull/6).
Run artifact: `/tmp/compound-engineering/ce-code-review/20260522-075842-b65c838c/`
Plan: `docs/plans/PRO-79-responsive-a11y-deploy.md`

No `safe_auto` fixes were applicable — every finding is **P3 / advisory**. The
diff is CSS + markup + build config only, and the implementation already passes
lint, typecheck, and `pnpm generate` (real pre-rendered HTML to `.output/public`).
All requirements R1–R10 are met. The items below are advisory notes that need
human judgment or are intentionally out of this ticket's surgical scope.

---

## 1. [P3 — advisory] [DEFERRED] Anchor targets lack `scroll-margin-top` under the sticky nav

**File / line.** `app/assets/css/chrome.css:114` (the new `@media (max-width: 480px)` nav-wrap block); behavior originates from `.nav { position: sticky; top: 0 }` at `chrome.css:33`.

**Issue.** In-page anchor jumps (`#work`, `#about`, `#contact`) scroll the target to viewport top, where the sticky `.nav` overlays it. Pre-existing at the 72px bar height; the new `<=480px` wrap lets the bar grow taller on mobile, so an anchor jump lands the target slightly further under the header on small screens.

**Why it matters.** Minor a11y/UX polish. Pre-existing — the sticky+anchor combination predates this PR, and the wrap is the correct fix for the real horizontal-overflow bug it was added to solve. Not a regression introduced by this ticket's intent.

**Suggested fix.** Optional follow-up: add `scroll-margin-top` to anchored sections/`[id]` targets (e.g. `section[id], [id] { scroll-margin-top: 88px; }`, tuned to the wrapped mobile bar height). One CSS rule, no behavior change to the visible layout.

**Why not auto-applied.** Pre-existing, out of PRO-79's surgical scope, and the offset value needs a human to confirm against the wrapped-nav height across breakpoints. Document choice, not a defect.

---

## 2. [P3 — advisory] [DEFERRED] `.entry .meta` AAA re-point targets a selector with no rendered consumer

**File / line.** `app/assets/css/sections.css:392`.

**Issue.** `.entry .meta` color was re-pointed from `--color-faint-gray` to `--color-ash-text` for AAA. But `ConsultingEntry.vue` (the only `.entry` consumer) emits `.idx / .entry-body / .tagline / .blurb / .label / .outcomes` and **no** `.meta` child, so the rule currently matches nothing on either route.

**Why it matters.** Harmless and forward-looking — any future `.meta` row inherits AAA contrast. The plan (U3) explicitly anticipated this ("if rendered — confirm consulting offerings actually emit a `.meta` row; current `ConsultingEntry.vue` markup may not"). Noted for accuracy, not as a problem.

**Suggested fix.** None required. Keep the rule (cheap insurance for a future `.meta`), or drop it if you prefer dead-selector hygiene. Either is fine.

**Why not auto-applied.** Advisory — anticipated by the plan; removing a forward-looking AAA rule is a judgment call, not a safe automatic edit.

---

## 3. [P3 — advisory] [DEFERRED] Node/pnpm pins in `netlify.toml` have no single source of truth

**File / lines.** `netlify.toml:13` (`NODE_VERSION = "22"`), `netlify.toml:14` (`PNPM_VERSION = "10"`).

**Issue.** `netlify.toml` pins Node 22 (LTS, satisfies Nuxt 4) while the local env runs Node v24.15.0, and pins pnpm 10 while `package.json` has no `packageManager` field. There is no `.nvmrc` or `engines` field anchoring a single version source, so local-vs-CI majors diverge by convention rather than enforcement.

**Why it matters.** Node 22 LTS is a deliberate, defensible CI choice (the plan's Open Question #4 flagged confirming the pin) and the build is version-tolerant — so this is a parity/hardening note, not a defect. pnpm major matches (local 10.33.2). No CLAUDE.md/AGENTS.md rule is violated.

**Suggested fix.** Optional hardening: add a `"packageManager": "pnpm@10.x"` field to `package.json` (helps Corepack-based local/CI parity) and/or an `.nvmrc` / `engines.node` to anchor the Node major. Confirm the desired Node major (22 LTS vs 24 to match local) before pinning more widely.

**Why not auto-applied.** Touches toolchain policy (`package.json` / repo-root version files) — needs a human to decide the canonical Node/pnpm versions and whether to introduce `packageManager`/`.nvmrc`. Out of PRO-79's surgical scope.

---

## Verified-clean (no action — recorded for the trail)

These were the task's flagged-attention areas; all checked out clean:

- **netlify.toml ↔ generate output:** `command = "pnpm generate"`, `publish = ".output/public"` match the actual local build — `.output/public/` holds real `index.html` (7796 B, "EXPERIMENTS"), `consulting/index.html` ("Ship AI"), `_nuxt`, `_fonts`, `_ipx`, `404.html`, and the skip link is in the pre-rendered HTML. TOML parses valid.
- **Reduced-motion completeness:** every animating transform/translate/scale is gated (card image scale, caption arrow, btn-arrow → `transition: none`; `.btn` narrowed to color-only; `:hover`/`:active` transforms zeroed). The `.nav` border-color transition and `.btn` color/background fades are non-motion and intentionally kept. The skip-link `transform: translateY` has **no** transition, so it snaps — no motion leak.
- **Contrast re-point, no home-page regression:** the two functional faint-gray consumers (footer `h4`, `.entry .meta`) were re-pointed to ash-text (8.02:1, AAA). Remaining `--color-faint-gray` consumers are dev-scaffolding only (`.faint` utility on `.t-caption faint` TODO captions, and the `.todo` marker) — explicitly out of the AAA-functional bar per the plan. No functional text dropped below AAA.
- **Skip link / tap-target a11y:** skip link is the first focusable element, `position: fixed` (no layout disturbance), jumps to `<main id="main" tabindex="-1">`. Tap-target enlargements are hit-area-only (flex centering + `min-height: 44px`), no new boxes/borders/radius; one `<h1>`, `<header>`, `<nav>`, `<main>`, `<footer>` per route confirmed in the built HTML. No a11y regression.

---

## Summary

- Findings (post-review): **0 P0, 0 P1, 0 P2, 3 P3** (advisory). (Two further P3
  advisories — `#2` and `#3` items #4/#2 in the artifact — were mode-aware-demotion
  suppressions in autofix; folded into the items above for completeness.)
- `safe_auto` fixes applied in-place: **0** (none applicable — no auto-fixable defects).
- Lint / typecheck / `pnpm generate`: **green**.
- Requirements R1–R10 against the plan: **met**.

Verdict: **Ready to merge.** All three residuals are advisory / deferred polish
items needing human judgment; none block the PR.

---

## Resolution status (post todo-resolve)

- [ ] **#1 P3 (deferred)** — `scroll-margin-top` for anchor targets under the
      sticky nav. Optional polish; pre-existing; out of scope.
- [ ] **#2 P3 (deferred)** — `.entry .meta` re-point matches no rendered
      consumer. Harmless/forward-looking; keep or drop at discretion.
- [ ] **#3 P3 (deferred)** — anchor a single Node/pnpm version source
      (`packageManager` / `.nvmrc` / `engines`). Toolchain policy decision.
