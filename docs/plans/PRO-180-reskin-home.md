# PRO-180 — Redesign v2 · 7 · Reskin Home + Writing teaser + newsletter band

Branch: `feature/PRO-180-reskin-home` · Base: `dev` · Worktree: `…/PRO-180`

## Brief

Recompose `/` (home) to the editorial design + expanded composition. Spec =
committed reference `_process/design-exploration-unzipped/Hero - Combined.dc.html`
+ screenshots `screenshots/01-home-blog.png` + `02-home-blog.png`.

Sections top → bottom:

1. **Editorial hero** — mono eyebrow "Claudio Mendonça — Founder. Designer.
   Engineer.", serif headline "AI" + the rotating words
   Experiments / Consulting / Training rendered **STATIC or CSS-only cycle**
   (no JS lib — the motion stack was removed in PRO-174), mono sub, CTAs
   "See the work" (#work) + "Consulting".
2. **Experiments grid** — restyled cards from `experiments.items` (`useSiteContent()`).
3. **About block.**
4. **Writing teaser** — "Notes from the workshop." with featured latest post +
   ~3 recent rows + "All posts →" link, pulled live from the `writing`
   collection (`queryCollection('writing')`, newest first, exclude drafts).
5. **Newsletter band** — reuse `NewsletterBand` (PRO-179).
6. **Footer restyle.**

Copy from the `site` collection, not hardcoded. **PRESERVE the `#work` and
`#about` anchors** (nav, footer, `public/_redirects`, and the `/about → #about`
redirect depend on them). Apply `[data-reveal]` reveals.

## State of the page on arrival (important)

The editorial reskin chain (PRO-174 → 175 → 176) already landed most of the home
page. `app/pages/index.vue` on arrival already:

- Uses `HeroSection` (slot-driven) with the mono eyebrow (`intro.eyebrow`),
  serif `<h1>` (`intro.headline` = "AI EXPERIMENTS"), mono sub (`intro.subhead`),
  filled "See the work" (`#work`) + ghost "Consulting" (`/consulting`) CTAs.
- Renders `#work` (ExperimentCard grid over `experiments.items`) and `#about`
  (bio block), both already pulling copy from `content/site.json` via
  `useSiteContent()`. No hardcoded strings.
- Tags `.section-head` and `.bio-body` with `[data-reveal]`.
- No marquee, count-up, GSAP/Lenis (all retired PRO-174).

`pnpm generate` is **green on arrival** (26 routes). So PRO-180 is a **gap-closing
+ additive composition** pass, not a from-scratch rebuild. The two new sections
(Writing teaser + newsletter band) are the bulk of the work; the hero/experiments/
about are already editorial.

The shared Writing CSS vocabulary already exists in `app/assets/css/sections.css`
under "Writing section (PRO-178)": `.hatch`, `.post-featured*`, `.post-card*`,
`.newsletter-stub*`. `NewsletterBand.vue` (PRO-179) is a drop-in `<section
id="newsletter">`. `formatMonthYear()` is auto-imported from `app/utils/format.ts`.

## Gaps vs. the reference + what to build

### 1. Writing teaser section (NEW — the main work)

Insert a new `<section id="writing">` between `#about` and the newsletter band.
Pull posts live:

```ts
const { data: posts } = await useAsyncData('home-writing-teaser', () =>
  queryCollection('writing')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all(),
)
const featured = computed(() => posts.value?.[0] ?? null)        // newest = featured
const recent   = computed(() => (posts.value ?? []).slice(1, 4)) // next 3 rows
```

Newest post is `a-chatbot-is-not-a-system` (Mar 2026) — matches the reference
featured block. Next 3: The 95% problem (Feb 15), Reports that build themselves
(Feb 1), Teaching a team to think with AI (Jan 20). `self-hosting-squoosh`
(Jan 10) falls off as the 4th — matches the reference exactly.

> **Decision (recorded in a Plane comment):** the teaser featured post is the
> **newest** post (`posts[0]`), NOT the `writing.featured` flag. The brief says
> "featured **latest** post … pulled live, newest first." On this dataset the two
> coincide (`a-chatbot-is-not-a-system` is both newest and `featured: true`), so
> the render is identical either way; "newest" is the literal brief wording and
> is robust if a future older post is flagged `featured`. The `/writing` index
> page keeps using the `featured` flag — that is its own contract (PRO-178),
> untouched.

Markup (matches `01/02-home-blog.png`):

- **Section head row**: `.label` eyebrow "Writing" is the established home
  pattern, but the reference + screenshot show the teaser leading with the serif
  headline. Use a two-part head:
  - top hairline meta row `WRITING … 05 / 05` (mono, `data-reveal`) — mirrors the
    reference's per-section `NN / 05` counter. The right number is the live post
    count (`posts.length`), left is a static section index. (Render the count from
    data, not a literal, so it stays honest.)
  - headline row: serif `<h2>` "Notes from the workshop." + right-aligned
    "All posts →" `NuxtLink` to `/writing`. (Reference glyph is `↗`; the home
    system's link convention is `→`. Use `→` to match the brief's literal
    "All posts →" and the home CTA arrow vocabulary. Recorded deviation.)
- **Featured block**: reuse the `.post-featured*` classes (hatch cover, mono meta
  `category / MMM YYYY / N min`, serif title, dek, "Read →" cta). Wrap in
  `NuxtLink :to="featured.path"`. This is the same component shape the `/writing`
  index uses; extract it into a shared `WritingTeaser.vue` component OR inline it
  on the page. **Decision: build a `WritingTeaser.vue` component** so the page
  stays declarative and the live query + featured/recent split is encapsulated and
  unit-testable. The page just renders `<WritingTeaser />`.
- **Recent rows**: a 3-row editorial list — `grid-template-columns: auto 1fr auto`
  → `category (mono, fixed width) | serif title | date · read-time (mono)`. This
  row layout is **new CSS** (`.teaser-row*`), added to the Writing block in
  `sections.css`. Each row is a `NuxtLink` to `post.path`. Separator is `·`
  (matches reference + screenshot `02`).
- Tag the meta row, headline, featured, and rows with `[data-reveal]`.

### 2. Newsletter band

Add `<NewsletterBand />` after the writing teaser (component already a full
`<section id="newsletter">`, PRO-179). No new code — just place it. The reference
shows the band inside the blog section; the shipped system renders it as its own
band (same as `/writing`), which is the source-of-truth composition.

### 3. Footer "restyle"

The footer is the shared `SiteFooter.vue` (rendered by `layouts/default.vue`),
already editorial (4-column grid, mono links, `#contact` anchor, monochrome
tokens). The reference footer is the same shape. **No change needed** — the
footer was restyled in the PRO-174→176 chain. Verify it renders correctly under
the new page; do not fork a page-specific footer. Recorded as no-op.

### 4. Experiments — cards vs. reference's text rows (deliberate keep)

The reference renders experiments as a hairline **text-row list** (`.exprow`:
index | serif title | tag↗). The shipped home uses the **`ExperimentCard` image
grid** (PRO-95/112). The brief says "experiments grid — **restyled cards**".
→ **Keep the existing `ExperimentCard` grid unchanged.** It already matches the
brief ("restyled cards … mono meta + serif/mono titles") and is the shipped
source-of-truth composition. The `.exprow` list is an exploration variant;
switching to it would discard the image-led card system and the
`ExperimentCard.spec.ts` contract. Recorded deviation.

### 5. Hero rotating words — STATIC (no JS)

The reference cycles "Experiments / Consulting / Training" via a JS typewriter.
The brief mandates **static or CSS-only, no JS lib**. The shipped hero already
renders a **static** serif `<h1>` from `intro.headline` ("AI EXPERIMENTS").

> **Decision (recorded in a Plane comment):** keep the hero headline **static**
> as it currently ships (`intro.headline`). Rationale: (a) the brief allows
> "rendered STATIC"; (b) a CSS-only 3-word cycle is decorative motion that would
> need its own reduced-motion guard and adds risk for zero content value; (c) the
> motion stack was deliberately removed in PRO-174 and the shipped hero is the
> source of truth. The eyebrow already carries the full
> "Claudio Mendonça — Founder. Designer. Engineer." identity line via
> `intro.eyebrow`. **No hero change in this ticket** beyond verification.
> If a future ticket wants the cycle, it is a scoped, content-flagged follow-up.

### 6. Hero pills + down-arrow (deliberate keep)

Same standing decision as PRO-177: the reference uses sharp buttons + no
down-arrow; the shipped `HeroSection` uses pill `.btn` (global `--radius-buttons`)
+ a down-arrow. Both are shared chrome shipped in PRO-174/175. **Not changed** —
flipping them is a cross-page theme change out of home scope.

## Files touched

| File | Change |
|---|---|
| `app/components/WritingTeaser.vue` | **NEW** — live `writing` query, featured (newest) + 3 recent rows, "All posts →". `data-reveal`. |
| `app/pages/index.vue` | Insert `<WritingTeaser />` + `<NewsletterBand />` between `#about` and the existing template tail. No change to hero / `#work` / `#about`. |
| `app/assets/css/sections.css` | Add `.writing-teaser*` section head + `.teaser-row*` recent-row layout under the Writing block. Reduced-motion neutralization for the row hover. |
| `docs/plans/PRO-180-reskin-home.md` | this file |

No change to: `HeroSection`, `ExperimentCard`, `NewsletterBand`, `SiteFooter`,
`SiteNav`, `content/site.json`, `content.config.ts`, `public/_redirects`,
`nuxt.config.ts`, the `writing` markdown.

## Anchor-preservation checklist (acceptance)

- `#work` — unchanged `<section id="work">` (nav "Experiments", footer
  `/#work`, hero CTA `#work`).
- `#about` — unchanged `<section id="about">` (nav "About" `/#about`,
  `public/_redirects` `/about → /#about`, footer `/#about`).
- `#contact` — `SiteFooter` (`footer id="contact"`), nav "Contact".
- `#newsletter` — `NewsletterBand` adds it (also on `/writing`).
- New `#writing` id is additive; nav "Writing" still points at the `/writing`
  route, not the anchor — no collision.

## Acceptance gates

1. Matches `01/02-home-blog.png` (hero → experiments → about → writing teaser →
   newsletter → footer) at 1280.
2. Teaser pulls the **latest** writing posts live (featured = newest;
   3 recent rows; "All posts →" → `/writing`). Excludes drafts. Newest first.
3. All copy from content (`site` collection for hero/about/experiments;
   `writing` collection for the teaser). No hardcoded post data.
4. Responsive at 375 / 768 / 1280 (featured + rows stack on mobile).
5. Reduced-motion safe ([data-reveal] double-guarded; row hover neutralized).
6. `#work` / `#about` anchors resolve.
7. `pnpm build` + `pnpm generate` green.

## Risks / notes

- **Hydration parity**: `formatMonthYear` pins `en-US` + UTC (already), and the
  live query is `useAsyncData`-keyed so it serializes into the prerendered
  payload — SSR/no-JS renders the full teaser. Same pattern as `/writing`.
- **Unique `useAsyncData` key**: use `home-writing-teaser` (distinct from the
  `/writing` page's `writing-index`) so the two payloads don't collide.
- **Empty/short dataset**: guard `v-if="featured"` and `v-if="recent.length"` so
  the teaser degrades cleanly if posts are removed.
