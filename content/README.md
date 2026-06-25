# site.json

The **single source of truth for every user-facing string** rendered by the
home (`/`) and consulting (`/consulting`) pages.

Since PRO-176 this file **drives the live Nuxt app**. It is the `site` collection
defined in `content.config.ts` (`type: 'data'`), loaded at build time by
`@nuxt/content` and read through the typed `useSiteContent()` composable
(`app/composables/useSiteContent.ts`). It is no longer an inert extract — the
former `app/data/experiments.ts` and `app/data/consulting.ts` arrays were folded
in here and deleted.

## How it's organized

Grouped by subject matter, not by which page a string lands on. The Zod schema in
`content.config.ts` mirrors these keys exactly.

| Key | What lives here |
|-----|-----------------|
| `meta` | Site title, description, canonical URL — the SEO basics. |
| `identity` | Who Claudio is + every contact/brand string: name, roles, tagline, location, email, social, elsewhere, copyright, builtWith. |
| `intro` | The homepage hero (eyebrow, headline, subhead, CTAs). |
| `about` | The homepage About block: `label`, `heading`, `intro`, the `practice` paragraph (stored as `before` / `linkLabel` / `linkTarget` / `after` fragments so the inline `/consulting` link stays in the content layer), and `availability`. |
| `experiments` | The homepage product grid. Each item: `id`, `title`, `tag`, `url`, `image`, `alt`, optional `ariaLabel`. |
| `consulting` | The whole service offer, split by sub-topic: `eyebrow`, `headline`, `subhead`, `ctas`, `deliverables`, `brief`, `differentiator` (+ `stat`), `offerings`, `process`, `pricing`, `cta`. |
| `navigation` | Primary nav labels + targets. |

## Values are stored as rendered (byte-identical contract)

PRO-176 requires the pages to render **byte-identical copy** — only the source
moved into `@nuxt/content`, not the words. So values here are stored exactly as
they render, including treatments the earlier interim extract had normalized away:

- **Casing is verbatim.** The hero eyebrow is stored uppercase
  (`CLAUDIO MENDONÇA — FOUNDER.DESIGNER.ENGINEER`) and experiment titles keep
  their shipped case (`BATCH SQUOOSH`, `Cut The Crap`). The visible uppercasing on
  eyebrows/labels/tags is still CSS (`text-transform`); the heading elements
  themselves render mixed-case Instrument Serif 400.
- **Inline `<br />` is kept.** Two offering titles carry a hard line break for the
  display font (`Automate the<br />repetitive.`), rendered via `v-html` in
  `ConsultingEntry.vue` (repo-controlled source, no XSS surface).
- **Link targets are the real `href` values.** CTAs and the nav use the exact
  anchors / URLs / `mailto:` the markup links to (`#work`, `#how`, `/consulting`,
  `mailto:claudioccm@gmail.com`).

## Not yet wired

`meta`, `identity`, and `navigation` are modelled in the schema (per the ticket's
key list) but the chrome that would consume them — `SiteNav.vue` and
`SiteFooter.vue` — still hardcodes those strings. Wiring the chrome to this
collection is follow-up work, not part of PRO-176.

## Known placeholders (carried over verbatim from source)

- **Prices are `9999,00`** — placeholder figures, not real pricing.
- **`identity.social` URLs are empty** — GitHub / X links are `href="#"` stubs in
  the live footer.
- Product screenshots are byte-identical placeholders until real captures land.
