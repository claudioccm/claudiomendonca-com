# PRO-181 — Polish & QA results

Final QA pass for Redesign v2 (epic PRO-173, step 8/8), after PRO-174…180.
Evidence captured against the static `nuxt generate` output served from
`.output/public` (the exact artifact Netlify publishes). Plan:
`docs/plans/PRO-181-polish-qa.md`.

## Summary

| Area            | Result |
| --------------- | ------ |
| Build / generate | ✅ `pnpm build` + `pnpm generate` green |
| Lint / typecheck / test | ✅ `pnpm lint`, `pnpm typecheck`, `pnpm test` (15) green |
| Prerender        | ✅ all 8 content routes in `.output/public` |
| Responsive       | ✅ 375 / 768 / 1280 / 1440 on home, consulting, /writing, post |
| Reduced-motion   | ✅ reveals off → all content static & visible (CSS-gated) |
| No-JS            | ✅ all copy + nav + links in served HTML on every route |
| a11y (Lighthouse) | ✅ 100 on all four routes |
| SEO (Lighthouse)  | ✅ 100 on all four routes |
| Best Practices    | ✅ 100 on all four routes |
| Performance (home)| ✅ LCP 114 ms, CLS 0.00 |

## Routes verified

- `/` (home)
- `/consulting`
- `/writing` (index)
- `/writing/a-chatbot-is-not-a-system` (representative post — covers the full
  post template incl. Article JSON-LD + per-post SEO)

## Lighthouse (desktop, navigation mode, against `.output/public`)

| Route | a11y | Best Practices | SEO |
| ----- | ---- | -------------- | --- |
| `/` | 100 | 100 | 100 |
| `/consulting` | 100 | 100 | 100 |
| `/writing` | 100 | 100 | 100 |
| `/writing/a-chatbot-is-not-a-system` | 100 | 100 | 100 |

**One a11y fix applied during this pass:** the post page initially scored a11y
**95** — Lighthouse `color-contrast` flagged `.article__role` (the 12px byline
subtitle "Design engineer — British Columbia"), which used `--faint` (#6F6A60)
on `--ink` (#0E0D0B) → 3.61:1, below WCAG AA 4.5:1 for small text. Changed the
token to `--dim` (#A8A39A, ~7.4:1) — preserves the author>role visual hierarchy
and matches the secondary-text token used by the meta row. Re-audit: **100**.

## Performance (home, Core Web Vitals)

From a `performance_start_trace` reload of `/`:

- **LCP 114 ms** (TTFB 3 ms + render delay 111 ms)
- **CLS 0.00**

No WebGL / heavy client JS (the motion stack was retired in PRO-174); the
editorial design is near-instant. CrUX field data n/a (local).

## Responsive

Full-page screenshots at 375 / 768 / 1280 / 1440 under
`docs/qa/screenshots/v2-*.png` (16 files). Captured in the reduced-motion
static state (see below) so every section is fully rendered in one frame.

- `v2-home-{375,768,1280,1440}.png`
- `v2-consulting-{375,768,1280,1440}.png`
- `v2-writing-{375,768,1280,1440}.png`
- `v2-post-{375,768,1280,1440}.png`

Layouts hold at every breakpoint: hero, experiments grid (5 items), About,
Writing teaser, newsletter band, footer (home); brief / differentiator / 3
offerings / how-it-works / pricing / CTA (consulting); header + filter chips +
featured + 4-card grid + newsletter (writing index); back-link + meta + title +
dek + byline + cover + prose body (post).

## Reduced-motion

Reveals are a **pure-CSS scroll-driven View Timeline** (`[data-reveal]`,
`animation-timeline: view()`) introduced in PRO-174 — no JS, no
IntersectionObserver. The animation is double-guarded:

```
@media (prefers-reduced-motion: no-preference) {
  @supports ((animation-timeline: view()) and (animation-range: entry)) { … }
}
```

Verified in-browser: the **base state of `[data-reveal]` is `opacity: 1`** (a
probe element with no animation reports `opacity: 1`). Under
`prefers-reduced-motion: reduce` the `no-preference` block never applies, so
every reveal element sits at its static visible base state with no animation and
no transition. Page transitions are likewise stripped under reduced-motion
(`base.css` `.page-*` rules), making route swaps instant. The responsive
screenshots were taken with the reveal animation forced off (mirroring the
reduced-motion render path) and show all content visible.

## No-JS

Confirmed against the served HTML in `.output/public` (grep) — all four route
types ship their full copy, nav, and links without client JS:

- **Home:** skip link, primary nav, all 5 experiment titles (Cut The Crap, Edge,
  BATCH SQUOOSH, Varro, Feedback), About copy, Writing teaser, newsletter,
  footer.
- **Consulting:** skip link, hero, brief, 3 offerings, pricing, CTA, canonical,
  cross-route `/#work` anchor.
- **/writing:** "The journal." header, filter chips (aria-labelled), featured
  post, 4 grid cards (5 posts total), newsletter input, canonical + og:url.
- **Post:** back link, meta row, serif title, dek, byline, rendered markdown
  body (h2 subheads, lists), `og:type=article`, canonical, **Article JSON-LD**.

## a11y spot checks

- **Skip link** — `<a href="#main" class="skip-link">` first focusable element
  in `default.vue`; jumps to `<main id="main" tabindex="-1">`.
- **aria-current** — `SiteNav` paints `aria-current="page"` on the active route
  (exact for `/` + `/consulting`, prefix-match for `/writing` so posts light the
  nav). Verified `Writing` lit on /writing and the post.
- **Newsletter input label** — `<label for="newsletter-email">Email address</label>`
  associated with the email input (`NewsletterBand.vue`); honeypot is
  aria-hidden + `tabindex="-1"`.
- **Heading order** — sequential h1→h2→h3 across pages + components (audited; no
  skipped levels). One h1 per route.
- **:focus-visible** — interactive focus rings present (Lighthouse a11y 100 on
  all routes; no focusable-element findings).

## SEO

- **Per-route canonical + og:url** on every route (verified live in DOM):
  - `/` → `https://claudiomendonca.com/`
  - `/consulting` → `…/consulting`
  - `/writing` → `…/writing` (title "Writing — Claudio Mendonça")
  - post → `…/writing/<slug>`, `og:type=article`, title `<post> — Claudio Mendonça`
- **Article JSON-LD** (added this ticket) on each post: `@type: Article` with
  headline, ISO-8601 `datePublished`/`dateModified` (re-parsed from the content
  layer's space-separated SQLite datetime → `2026-03-01T00:00:00.000Z`),
  author/publisher (Person), and canonical `url`/`mainEntityOfPage`. Ships in the
  prerendered `<head>`; validated in-DOM (`@type === "Article"`).

## Prerender

`.output/public` contains all 8 content routes after `pnpm generate`
(26 routes total incl. payloads/assets):

```
/index.html
/consulting/index.html
/writing/index.html
/writing/a-chatbot-is-not-a-system/index.html
/writing/the-95-percent-problem/index.html
/writing/reports-that-build-themselves/index.html
/writing/teaching-a-team-to-think-with-ai/index.html
/writing/self-hosting-squoosh/index.html
```

`/about/index.html` is also emitted (the 301→`/#about` rule); `_redirects` is
present with the `/about` rule for the static Netlify deploy.

## Hygiene / dead code

- Removed `app/composables/useReducedMotion.ts` + `tests/useReducedMotion.spec.ts`
  — dead since PRO-174 retired the motion stack (reduced-motion is CSS-only;
  the composable had no consumers in app code). Fixed the stale
  `useReducedMotion` reference in the `tests/SiteNav.spec.ts` header comment.
- Component audit: all 11 components in `app/components/` are referenced; no
  orphans. No unused composables remain (`useSiteContent` is in use).
- Dependency set is minimal (`@nuxt/content`, `nuxt`, `resend`, `vue`,
  `vue-router` + dev tooling); nothing obviously dead introduced by the redesign.

## Console

No console errors or warnings on any of the four routes (checked via
chrome-devtools on the served static build).

## Decisions / out of scope (residual)

- **Sitemap — skipped (default).** The brief lists "sitemap if added" as
  optional. With only 8 static, already-prerendered + crawlable routes and a
  permissive `robots.txt`, a sitemap adds little and would mean a new
  `@nuxtjs/sitemap` dependency on a verification ticket. Recorded as a
  nice-to-have residual; revisit if the post count grows materially.
