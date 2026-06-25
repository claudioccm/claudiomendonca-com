# PRO-181 — Polish & QA (responsive, a11y, reduced-motion, SEO, prerender)

Redesign v2 step 8/8 (epic PRO-173). Final QA pass across **all** routes after
PRO-174…180. Verification-only ticket: the only in-scope code changes are
*genuinely small, safe* fixes (a11y attributes, missing meta, prerender route
additions, dead-code removal). Anything larger is recorded as a residual.

Harness template: `docs/plans/PRO-114-qa-plan.md` (the PRO-108 dark-redesign QA
pass). Evidence lands under `docs/qa/`.

## Routes in scope

- `/` (home)
- `/consulting`
- `/writing` (index)
- `/writing/<slug>` (a representative post — `a-chatbot-is-not-a-system`)

Five posts total (content/writing/*.md); all five are listed in
`nuxt.config.ts` prerender routes.

## Targets / acceptance

- **Responsive** 375 / 768 / 1280 / 1440 on home, consulting, /writing, a post —
  screenshots committed under `docs/qa/screenshots/`.
- **Reduced-motion** pass: reveals off, no transitions, instant route swaps
  (CSS-driven via `@media (prefers-reduced-motion: reduce)` — the motion stack
  was retired in PRO-174). Verify content intact.
- **No-JS** pass: all copy in served HTML; nav + links usable. Grep
  `.output/public/**/index.html` for load-bearing copy.
- **a11y**: sequential heading order, skip link, `:focus-visible` on all
  interactives, `aria-current` nav, form label on the newsletter input.
  Lighthouse a11y ≥ 95 on every route.
- **SEO**: per-route canonical + `og:url`/title/description on /writing index +
  each post; **Article JSON-LD** added to posts (small, safe enhancement);
  sitemap evaluated (see decision below).
- **Prerender**: confirm `/`, `/consulting`, `/writing`, and every post in
  `.output/public` after `pnpm generate`.
- **Hygiene**: remove dead code left from the redesign (the brief flags
  `useReducedMotion` — confirmed unused in app code). No orphaned
  components/composables/deps.
- `pnpm build` + `pnpm generate` green; `pnpm test` + `pnpm lint` green.

## Pre-audit findings (ground truth from the worktree)

Most acceptance items are **already satisfied** by PRO-174…180:

- Skip link present (`app/layouts/default.vue` — `<a href="#main">`).
- `aria-current="page"` nav painting + prefix match for posts (`SiteNav.vue`).
- Newsletter input has `<label for="newsletter-email">` (`NewsletterBand.vue`).
- Canonical + `og:url` on all four route types; posts also set `ogType:article`.
- Heading order sequential (h1→h2→h3) across pages + components (audited).
- Prerender `routes` already list `/`, `/consulting`, `/writing`, all 5 posts.
- Reduced-motion handled in CSS (`base.css`, `GrainOverlay.vue`,
  section CSS) — no JS dependency.

So the implementation work is small:

### Code changes (small + safe — apply directly)

1. **Dead-code removal.** `app/composables/useReducedMotion.ts` is unused in app
   code (reduced-motion is CSS-only since PRO-174). Remove the composable and
   its test `tests/useReducedMotion.spec.ts`. Fix the stale reference in
   `tests/SiteNav.spec.ts` (line ~9 lists `useReducedMotion` as a SiteNav
   auto-import dependency — SiteNav.vue does not use it).
2. **Article JSON-LD** on `/writing/[slug]` via `useJsonld`/`useHead` script —
   `@type: Article` with headline, datePublished, author, url, description.
   Improves SEO; ships in prerendered HTML.

### Decisions (defaults, recorded here per autonomy contract)

- **Sitemap:** the brief says "sitemap if added" (optional). With only 8 static
  routes already prerendered + crawlable and a permissive `robots.txt`, a
  sitemap adds little. **Default: skip** the `@nuxtjs/sitemap` module (avoids a
  new dependency on a verification ticket) — recorded as a residual/nice-to-have
  rather than built. Revisit if post count grows.
- **Representative post for QA:** `a-chatbot-is-not-a-system` (the featured
  essay) — covers the full post template incl. JSON-LD + meta.

## Passes (STEP 2 / STEP 6)

1. **Hygiene + JSON-LD** code changes above; `pnpm lint && pnpm test` green.
2. **Build/generate.** `pnpm build` then `pnpm generate`; confirm
   `.output/public/{index,consulting/index,writing/index}.html` + all five
   `writing/<slug>/index.html` exist with real content.
3. **No-JS grep.** Confirm hero/section copy + nav + links present in served
   HTML for each route; confirm JSON-LD `<script type="application/ld+json">`
   in a post.
4. **Responsive screenshots.** 375/768/1280/1440 on the four routes →
   `docs/qa/screenshots/` (prefix `v2-` to avoid clobbering the PRO-114 set).
5. **Reduced-motion.** Emulate `prefers-reduced-motion: reduce`; confirm no
   reveal/transition motion, content intact, route swap instant.
6. **Lighthouse.** a11y/perf/BP/SEO per route; a11y ≥ 95. Record numbers.
7. **a11y spot checks.** Skip link focus, `:focus-visible` rings, nav
   `aria-current`, newsletter label association.

## Out of scope (→ residual)

Anything needing structural change (component refactor, new runtime dependency,
new content tooling). Record in Plane + PR body; do not build. Sitemap module is
the main candidate.

## Verification ground truth

- 5 posts confirmed in `content/writing/`; all 5 in `nuxt.config.ts` routes.
- No `.github/workflows` → CI gate = `pnpm build/generate` + browser tests.
- QA evidence doc → `docs/qa/PRO-181-qa-results.md`.
