# PRO-176 — Content layer: @nuxt/content + migrate content.json + wire page copy

Status: in progress
Branch: feature/PRO-176-content-layer
Depends on: PRO-174 (motion retired), PRO-175 (editorial tokens)
Establishes the schema/pattern PRO-178 (Writing index) builds on.

## Goal

Make `@nuxt/content` v3 the site's content layer. Fold the already-extracted
`content/content.json` into it as the live source for page copy, and define the
Zod schema the Writing section will later use.

Acceptance (from the ticket):
- Home + Consulting render **identical copy**, now sourced from `@nuxt/content`.
- `content/content.json` is no longer an orphan file.
- `pnpm typecheck` green; `pnpm generate` includes the content in static output.
- Re-check the two PRO-175 foundation `!important` rules in `base.css`; drop
  them **only if** heading styling stays correct.

## Constraints / invariants

- **Byte-identical rendered text.** Only the *source* of the copy changes, not
  the words. Baseline captured to `/tmp/pro176/{home,consulting}.before.txt`
  from a pre-change `nuxt generate`; the post-change render must diff clean.
- Static-generate-safe: the site ships via `nuxt generate` → `.output/public`
  (Netlify). `@nuxt/content` v3's SQLite layer must prerender into the static
  output (better-sqlite3 dev / WASM-friendly prod). Verify content is queryable
  in prerendered HTML, not just dev.
- Section ids `#work` / `#about` / `#how` / `#consulting` / `#contact` are
  load-bearing (nav, footer, `_redirects`, `/about` redirect). Do not touch.

## Key decision — single source of truth

`content.json` is a *subset* of what the components actually render. Two gaps:
1. `experiments.items` carry `name`/`description` only; `app/data/experiments.ts`
   adds `title`/`tag`/`url`/`image`/`alt`/`ariaLabel` (richer, this is what
   renders).
2. `consulting.offerings.items` lack the embedded `<br />` line breaks that
   `app/data/consulting.ts` titles carry (`Automate the<br />repetitive.` etc.).

Decision: **fold `app/data/experiments.ts` + `app/data/consulting.ts` into the
site collection** so the JSON is the single source of truth. The migrated
`content/site.json` is *enriched* to carry the exact field values the components
render today (experiments rich fields; offering titles with `<br />`). This is
the only way to satisfy both "single source of truth" and "byte-identical".

A thin typed accessor composable (`useSiteContent()`) wraps the collection query
so pages/components get typed copy without repeating `queryCollection` plumbing.

## Steps

### U1 — Add @nuxt/content + content.config.ts
- `pnpm add @nuxt/content`.
- Add `'@nuxt/content'` to `nuxt.config.ts` modules (before `@nuxt/eslint`).
- Create `content.config.ts` at repo root with two collections:
  - `site` — `type: 'data'`, `source: 'site.json'`, Zod schema mirroring keys
    `meta` / `identity` / `intro` / `about` / `experiments` / `consulting` /
    `navigation`. Mirror the edge repo's `defineContentConfig` + `z` style.
  - `writing` — `type: 'page'`, `source: 'writing/**'`, schema: `title`,
    `category` enum (`Essay | Field notes | Opinion | Training | Build log`),
    `date` (offset-tolerant datetime via shared `datetimeOffset()` helper),
    `dek`/`excerpt`, `cover` optional, `readingTime` optional, `draft` default
    `false`, `featured` default `false`.
- Keep the `datetimeOffset = () => z.string().datetime({ offset: true })` helper
  comment lineage from edge.

### U2 — Migrate content.json → content/site.json (enriched)
- Move `content/content.json` → `content/site.json` (git mv), enriching:
  - `experiments.items[]` → carry `id`, `title`, `tag`, `url`, `image`, `alt`,
    optional `ariaLabel` (values lifted verbatim from experiments.ts).
  - `consulting.offerings.items[]` → titles carry the `<br />` exactly as in
    consulting.ts; keep `tagline`/`blurb`/`outcomes`.
- Delete the now-orphaned `content/content.json`. Keep `content/README.md` (or
  update it to describe the collection).

### U3 — Typed accessor
- `app/composables/useSiteContent.ts`: `queryCollection('site').first()`
  returning the typed `site` doc. SSR/generate-safe (`useAsyncData`-backed).

### U4 — Wire index.vue
- Replace inline hero/about strings + `import { experiments }` with copy read
  from the site collection. Experiments grid iterates `site.experiments.items`.
- Render values must be byte-identical (eyebrow casing is CSS-driven; the source
  string stays mixed-case as today's inline markup string).

### U5 — Wire consulting.vue + HowItWorks + CtaBanner
- Replace inline hero/brief/differentiator/pricing/tag-strip strings and
  `import { consultingOfferings }` with site-collection copy.
- ConsultingEntry titles use `v-html` (already) — feed the `<br />`-bearing
  strings from the collection.
- HowItWorks (currently fully static markup) + CtaBanner (currently props from
  page) read from the collection where the JSON owns that copy.

### U6 — Delete app/data/*.ts
- Remove `app/data/experiments.ts` + `app/data/consulting.ts` once nothing
  imports them. Preserve their TS interfaces in the composable/types if needed.

### U7 — PRO-175 !important re-check (conditional)
- `base.css` `h1..h6 { font-weight:400 !important; text-transform:none !important }`
  were added because `sections.css` (loaded later) sets `uppercase` + `500` on
  heading selectors. PRO-176 is documented as the point to drop them IF the
  section-level rules are also removed and headings still render Instrument
  Serif 400 mixed-case. **This requires removing the section-level
  uppercase/500 from heading selectors** — but those same `uppercase`/`500`
  rules are shared with labels/eyebrows/tags that MUST stay uppercase. Audit:
  drop the base `!important` only if it can be done without regressing heading
  case/weight in the browser. If not cleanly safe, KEEP them and document why
  (scope discipline — no risky cascade churn beyond the ticket's intent).

### U8 — Verify
- `pnpm typecheck` + `pnpm generate` green.
- Re-extract rendered text; diff against `/tmp/pro176/*.before.txt` — must be
  byte-identical.
- Confirm content present in `.output/public` HTML (not an empty shell).
- Browser test home + consulting: copy present, styling intact, light/dark fine.

## Risks
- @nuxt/content v3 SQLite in static generate — if prerender can't query, content
  is missing from output. Mitigation: verify the generated HTML contains the
  copy, not just dev server.
- Byte-identical trap: HTML-entity / whitespace differences from moving strings
  into data. Mitigation: the normalized-text diff in U8.
