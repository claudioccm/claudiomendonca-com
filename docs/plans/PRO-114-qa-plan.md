# PRO-114 — QA, a11y, perf, deploy preview (lightweight plan)

LFG 6/6 of the dark redesign epic (PRO-108). Verification only — **no new
features**. Only cheap a11y wins (labels, contrast, focus order, alt text) are
in-scope code changes; anything larger is recorded as a residual.

## Targets / acceptance

- Lighthouse a11y **≥95** both pages (home + /consulting). Record perf, BP, SEO
  too. WebGL hero + smooth-scroll trade perf — report the number, don't hide it.
- 8 screenshots: home + /consulting at **375 / 768 / 1280 / 1440** → committed
  under `docs/qa/screenshots/`, linked in a Plane comment.
- `prefers-reduced-motion` pass: static, no WebGL, content intact.
- No-JS pass: hero copy + all sections + links present in served HTML.
- `pnpm typecheck && lint && test && generate` all green; `.output/public` has
  real content + `_redirects` (incl `/about`).
- Netlify dev-alias redeploy → preview URL.

## Passes (STEP 2)

1. **Console clean.** `pnpm install`, `pnpm dev`. Load home + /consulting via
   chrome-devtools MCP; console must be error-free on both.
2. **Responsive screenshots.** Resize to 375 / 768 / 1280 / 1440, screenshot
   each page (8 total). Save to `docs/qa/screenshots/`.
3. **Lighthouse.** `lighthouse_audit` (or `npx lighthouse`) for both pages;
   capture a11y / perf / BP / SEO. If a11y <95, fix cheap wins and re-run.
4. **Reduced-motion.** Emulate `prefers-reduced-motion: reduce`; confirm no
   WebGL canvas, no split/kinetic animation, marquee + counter static, all copy
   present.
5. **No-JS.** `pnpm generate`; grep `.output/public/index.html` and
   `.output/public/consulting/index.html` for:
   - Home: hero eyebrow + headline words (EXPERIMENTS/CONSULTING/TRAINING) + sub
     copy; 5 experiment titles (Cut The Crap, Edge, BATCH SQUOOSH, Varro,
     Feedback); About copy; nav + footer links.
   - Consulting: hero headline + sub; 3 offerings (Opportunity Audit, Automate
     the repetitive, Empower your team); the **95%** stat; CTA mailto; nav +
     footer.
   - Confirm `.output/public/_redirects` exists and contains the `/about` rule.

## Verification ground truth

- 5 experiments / 3 offerings confirmed from `app/data/experiments.ts` and
  `app/data/consulting.ts`.
- Section ids `#work` / `#about` / `#consulting` / `#contact` are load-bearing.
- No `.github/workflows` → STEP 8 CI = local gate.

## Out of scope (→ residual)

Any a11y/perf issue needing structural change (component refactor, new
dependency, WebGL rework). Record in Plane + PR body; do not build.
