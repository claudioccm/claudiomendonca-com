# site.json

The content source for the home (`/`) and services (`/consulting`) pages.
Shared navigation, footer, and form labels remain in their Vue components.

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
| `identity` | Who Claudio is + every contact/brand string: name, roles, tagline, location, email, social, elsewhere, copyright, and client logos (`trustedBy`). |
| `intro` | The homepage hero (headline, rotating questions, subhead, CTAs). |
| `problems` | Recurring small-business problems, example fixes, and the services CTA. |
| `about` | The homepage About block: `heading`, `intro`, the `practice` paragraph (stored as `before` / `linkLabel` / `linkTarget` / `after` fragments so the inline `/consulting` link stays in the content layer). |
| `work` | The homepage product grid. Each item: `id`, `title`, `tag`, `url`, `image`, `alt`, optional `ariaLabel`. |
| `consulting` | The whole service offer, split by sub-topic: `headline`, `subhead`, `ctas`, `brief`, `differentiator` (+ `startingPoint`), `offerings`, `process`, `cta`. |
| `navigation` | Primary nav labels + targets. |

## Rendering

The current copy addresses small businesses in Squamish and the Sea-to-Sky.
The hero rotates questions from `intro.typewriter`; its accessible label
uses the first complete question. AI is presented as an enabler of useful
software and connected data. The main entry offer is one scoped first fix.

- Headings are plain text with no forced line breaks; CSS balances their
  wrapping at each screen size. Casing is stored as written.
- CTA targets are actual routes or anchors. The services route remains
  `/consulting` to preserve existing links.
- `meta` supplies default metadata in `nuxt.config.ts` and homepage metadata.
- `identity` and `navigation` are modelled here, but the shared chrome still
  uses component-level strings. Keep those components aligned when editing.

Prices are agreed after scoping a task; there are no placeholder prices.
The previous statistical callout has been replaced with the first-fix offer.

Client logos appear in both heroes. `identity.trustedBy.clients` supplies the name, local SVG path, and intrinsic dimensions. The assets are in `public/clients`; CSS renders them white at 40% opacity. Harvard, Meta, and Berkeley assets came from the existing ccmdesign site. The NYU asset is from [NYU’s logo on Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Nyu_long_white.svg), which credits NYU’s brand downloads.
