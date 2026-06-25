# PRO-178 — Redesign v2 · 5 · Writing section

Branch: `feature/PRO-178-writing-section` · Base: `dev` · Worktree: `…/PRO-178`

## Brief

Build the new Writing area. Spec = committed references
`_process/design-exploration-unzipped/Blog.dc.html` + `Blog Post.dc.html` +
screenshots `01-blog2.png`, `02-blog2.png`, `01-post.png`, `02-post.png`.

- `app/pages/writing/index.vue` — page header "The journal." + dek; category
  filter chips (All / Essays / Field notes / Training / Opinion / Build log); a
  featured post block; a grid of post cards (diagonal-hatch cover placeholder,
  `category · date · read-time` mono meta, serif title, dek); newsletter band.
- `app/pages/writing/[slug].vue` — "← Back to writing"; mono meta row; serif
  title; italic-serif dek; author byline w/ avatar; cover; `<ContentRenderer>`
  body — mono prose (line-height ~1.7) with serif h2 subheads.
- Seed 3–5 markdown posts in `content/writing/` from the screenshot demo copy.
- Add "Writing" → `/writing` to SiteNav (order Experiments / Writing /
  Consulting / Contact), with aria-current.
- `nuxt.config` prerender: add `/writing`; ensure each post path prerenders.
- Newsletter: a clearly-marked non-functional stub band ("Edge — the
  newsletter") with a `<!-- PRO-179: replace with functional NewsletterBand -->`
  marker. PRO-179 will replace it with the real Resend-backed component.

## State on arrival

- The `writing` `@nuxt/content` collection (`type: 'page'`, `source: writing/**`)
  schema already exists from PRO-176 in `content.config.ts`. Fields:
  `title` (req), `category` (enum), `date` (offset ISO), `dek?`, `excerpt?`,
  `cover?`, `readingTime?`, `draft` (default false), `featured` (default false).
- `content/writing/` is **empty** — no posts yet.
- `@nuxt/content` 3.14 + `@nuxtjs/mdc` 0.22 — `queryCollection('writing')` and
  `<ContentRenderer>` are available.
- Design system: warm-black `--ink` paper, cream `--paper` text, Instrument Serif
  display (`--font-disp`), JetBrains Mono body (`--font-sans`/`--font-mono`).
  `.shell`, `.label`, `[data-reveal]` (pure-CSS, double-guarded), `.btn` atoms
  all established. Sections separated by `section + section` hairline border.
- SiteNav hardcodes its links (the `navigation` collection is modelled but not
  yet wired — out of scope to wire here). Links are `<a :href>` with a
  `routeMatch` driving `aria-current`. Current order: Experiments / Consulting /
  About / Contact (About hidden on small screens). Contact = `#contact` anchor.

## Key decisions (defaults taken, recorded here per item-runner contract)

1. **Schema category enum vs. chip labels.** The schema enum is
   `['Essay', 'Field notes', 'Opinion', 'Training', 'Build log']` (singular
   "Essay"). The reference chip label is the plural "Essays". → Posts use the
   **schema enum value** (`Essay`) in frontmatter; the index renders the filter
   chip labelled **"Essays"** but filters on the `Essay` category. A small
   label→category map handles the one mismatch; all other chips match the enum
   1:1. Not touching the committed schema (other tickets depend on it).

2. **Filter chips are client-side, progressively enhanced.** The chips filter the
   rendered grid via a reactive `activeCategory` ref. SSR renders **All** (every
   post present in the static HTML — good for crawlers / no-JS). JS upgrades the
   chips to interactive filters. No URL/query-param routing (keep it simple; the
   reference chips are visual-only). "All" is the default active chip.

3. **Featured post.** Mark **"A chatbot is not a system"** `featured: true` (it is
   the featured block in `01-blog2.png` and the sample post in `01/02-post.png`).
   The index featured block selects the first `featured: true` post; the grid
   ("More posts") shows the rest. Exactly one featured.

4. **Reading time.** Set `readingTime` (minutes, integer) in frontmatter per post
   (matches the schema's optional `readingTime: number`). Simpler + deterministic
   than computing from body at render; the bodies are short seed copy. Values
   taken from the reference meta rows (6 / 4 / 5 / 7 / 5 min).

5. **Seed posts (5).** Slugs + frontmatter from the demo copy:
   - `a-chatbot-is-not-a-system.md` — Essay · 2026-03-01 · 6 min · **featured**
   - `the-95-percent-problem.md` — Opinion · 2026-02-15 · 4 min
   - `reports-that-build-themselves.md` — Field notes · 2026-02-01 · 5 min
   - `teaching-a-team-to-think-with-ai.md` — Training · 2026-01-20 · 7 min
   - `self-hosting-squoosh.md` — Build log · 2026-01-10 · 5 min
   The chatbot post gets the full reference body (intro, two h2 subheads, a `→`
   list, a pullquote, closing). The other four get realistic short bodies
   (~2–4 paragraphs + one h2) derived from their dek so each post renders a
   complete article.

6. **Covers.** The reference covers are pure diagonal-hatch CSS placeholders (no
   image files). → Render the hatch placeholder in CSS; `cover` frontmatter is
   left unset for all seed posts (schema makes it optional). A `.hatch` utility
   class drives the `repeating-linear-gradient`. Keeps the build asset-free and
   matches the screenshots exactly.

7. **Newsletter band = stub.** Visual-only band at the bottom of the index
   ("Edge — the newsletter", email input + Subscribe button), `disabled` /
   `aria-disabled` and a "Coming soon" note so it is clearly non-functional, with
   the `<!-- PRO-179: replace with functional NewsletterBand -->` marker. No
   form submit handler. PRO-179 replaces it.

8. **Date formatting.** Frontmatter dates are full ISO (`2026-03-01T00:00:00Z`)
   to satisfy `z.string().datetime({ offset: true })`. The UI shows the short
   "Mar 2026" form (index cards) and "March 2026" (post header) via a small
   `formatMonthYear` helper in `app/utils/format.ts` (sits beside `padIndex`).

9. **Nav order.** New order Experiments / Writing / Consulting / Contact. **About
   is kept** (the brief lists the four primary items but About is existing
   shipped chrome — an in-page anchor, `routeMatch: null`, hidden on small). Drop
   would be an unrelated chrome change. Writing inserted after Experiments with
   `routeMatch: '/writing'` so it paints `aria-current="page"` on the route. Same
   insertion mirrored in the SiteFooter "Site" column for consistency.

10. **Reveal / reduced-motion.** Reuse the existing `[data-reveal]` utility
    (already double-guarded for reduced-motion / no-JS / unsupported browsers).
    No new motion. The reading-progress bar + JS reveal in the `.dc.html` decks
    are **not** ported (the shipped system uses the CSS-only reveal; a progress
    bar is new chrome out of scope).

## Components

- `app/components/PostCard.vue` — leaf card for the grid: hatch cover, mono meta
  row (`category / date / read-time`), serif title, dek. Wraps a `NuxtLink` to
  `/writing/{slug}`. Carries `data-reveal`. Mirrors `ExperimentCard` conventions.
- `app/components/NewsletterStub.vue` — the non-functional band (so the index
  template stays clean and PRO-179 has one file to replace). Carries the marker.
- Featured block + post page kept inline in their pages (one-off layouts).

## Routes / data

- `app/pages/writing/index.vue`: `queryCollection('writing')`, filter
  `draft !== true`, sort by `date` desc. Compute `featured` (first featured) +
  `rest`. `useAsyncData` keyed `'writing-index'` for generate-safety.
- `app/pages/writing/[slug].vue`: `queryCollection('writing').path(route.path)
  .first()` for the doc; render `<ContentRenderer :value="doc">`. 404 via
  `createError` when not found. "Next" link = next post by date (optional, nice
  to have; keep if cheap).
- `nuxt.config.ts`: add `/writing` to `nitro.prerender.routes`. `crawlLinks` is
  already `true`, so the index's `NuxtLink`s to each `/writing/{slug}` are
  crawled and prerendered automatically. Also add the five explicit post paths to
  `routes` as a belt-and-suspenders guarantee (self-documenting, matches the
  existing comment's intent that unlinked routes be listed on purpose).

## Styles

All in `app/assets/css/sections.css` (loaded last), namespaced under a
`/* ---------- Writing ---------- */` block:
- `.writing-header` (page header), `.filter-chips` + `.filter-chips__item`
  (`.is-active`), `.post-featured`, `.hatch` cover utility, `.posts-grid`,
  `.post-card` parts (cover/meta/title/dek), `.newsletter-stub`,
  `.article` + `.article__back` + `.article__meta` + `.article__dek` +
  `.article__byline`, and `.prose` (mono body ~1.7 line-height, serif h2
  subheads, `→` list markers, pullquote, links) for the `<ContentRenderer>`
  output. Cream on ink throughout.

## Acceptance

- `/writing` index + a sample post render per the four screenshots.
- Posts come from `@nuxt/content` (`queryCollection('writing')`).
- Nav updated; "Writing" paints `aria-current="page"` on `/writing`.
- `/writing` + each `/writing/{slug}` appear under `.output/public`.
- Reduced-motion safe (reveal opt-in + guarded; filter chips degrade to full
  static grid with no JS).
- `pnpm build` + `pnpm generate` green.

## Verification

1. `pnpm build` then `pnpm generate` green; confirm `.output/public/writing/`
   index + each post `index.html` exist.
2. `browse` screenshots of `/writing` + one post at 375 / 768 / 1280; eyeball vs
   refs.
3. Filter chips toggle the grid; `aria-current` on the Writing nav link.
4. `prefers-reduced-motion: reduce` → fully visible, no hidden start state.
5. No console errors; all post copy present in SSR HTML.
