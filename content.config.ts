/**
 * Nuxt Content v3 collection definitions (PRO-176).
 *
 * Two collections:
 *   - `site`    — type 'data', single `content/site.json`. The live source of
 *                 truth for all page copy (home + consulting). Migrated from the
 *                 former interim `content/content.json`, enriched to carry the
 *                 exact field shape the components render (the experiments cards
 *                 and the consulting offerings, which previously lived in
 *                 app/data/*.ts). Folding those arrays in here makes this file
 *                 the single source of truth (PRO-176 acceptance).
 *   - `writing` — type 'page', `content/writing/**`. Schema only for now; the
 *                 Writing index/posts land in PRO-178. The schema mirrors the
 *                 editorial taxonomy the redesign uses.
 *
 * Datetime convention: the `writing.date` field uses the shared
 * `datetimeOffset` helper (offset-tolerant ISO-8601) so both `Z`-suffixed UTC
 * and `±HH:MM` offset forms parse — matching the convention established in the
 * sibling `edge` repo's content.config.ts.
 */
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/**
 * Shared offset-tolerant ISO-8601 datetime validator. Accepts both
 * `Z`-suffixed UTC and `±HH:MM` offset forms.
 */
const datetimeOffset = () => z.string().datetime({ offset: true })

/** { label, url } pair used by identity.social / identity.elsewhere. */
const linkEntry = z.object({
  label: z.string(),
  url: z.string(),
})

/** { label, target } pair used by CTAs and navigation. */
const targetEntry = z.object({
  label: z.string(),
  target: z.string(),
})

const site = defineCollection({
  type: 'data',
  source: 'site.json',
  schema: z.object({
    meta: z.object({
      siteName: z.string(),
      title: z.string(),
      description: z.string(),
      url: z.string(),
    }),

    identity: z.object({
      name: z.string(),
      roles: z.array(z.string()),
      title: z.string(),
      tagline: z.string(),
      location: z.string(),
      availability: z.string(),
      email: z.string(),
      social: z.array(linkEntry),
      elsewhere: z.array(linkEntry),
      copyright: z.string(),
    }),

    intro: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      subhead: z.string(),
      ctas: z.array(targetEntry),
      // Words cycled by the home hero typewriter (HomeHero.vue). The headline
      // reads "<headline> <typewriter[i]>" — e.g. "AI Experiments". SSR / no-JS /
      // reduced-motion render the first word statically. Optional → if unset the
      // hero shows the bare headline.
      typewriter: z.array(z.string()).optional(),
    }),

    about: z.object({
      label: z.string(),
      heading: z.string(),
      intro: z.string(),
      // The middle paragraph carries an inline route link to /consulting, so it
      // is stored as text fragments around the link rather than a flat string —
      // keeps the link in the content layer while the page renders the anchor.
      practice: z.object({
        before: z.string(),
        linkLabel: z.string(),
        linkTarget: z.string(),
        after: z.string(),
      }),
      availability: z.string(),
    }),

    experiments: z.object({
      heading: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          tag: z.string(),
          url: z.string(),
          image: z.string(),
          alt: z.string(),
          // Sentence-case description shown as the mono right-hand text of the
          // home Experiments index rows (ExperimentRow.vue). Falls back to `tag`
          // when unset.
          description: z.string().optional(),
          // Optional terser accessible name for the link; falls back to `title`.
          ariaLabel: z.string().optional(),
        }),
      ),
    }),

    consulting: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      subhead: z.string(),
      ctas: z.array(targetEntry),
      deliverables: z.array(z.string()),
      brief: z.object({
        label: z.string(),
        heading: z.string(),
        paragraphs: z.array(z.string()),
      }),
      differentiator: z.object({
        label: z.string(),
        heading: z.string(),
        paragraphs: z.array(z.string()),
        stat: z.object({
          value: z.string(),
          label: z.string(),
          note: z.string(),
          source: z.string(),
        }),
      }),
      offerings: z.object({
        label: z.string(),
        heading: z.string(),
        outcomesLabel: z.string(),
        items: z.array(
          z.object({
            id: z.string(),
            // May carry an embedded `<br />` to control the display-font line
            // break; rendered via v-html in ConsultingEntry (static source,
            // not user input).
            title: z.string(),
            tagline: z.string(),
            blurb: z.string(),
            outcomes: z.array(z.string()),
          }),
        ),
      }),
      process: z.object({
        label: z.string(),
        heading: z.string(),
        steps: z.array(
          z.object({
            title: z.string(),
            body: z.string(),
          }),
        ),
      }),
      pricing: z.object({
        label: z.string(),
        heading: z.string(),
        lead: z.string(),
        rows: z.array(
          z.object({
            item: z.string(),
            qualifier: z.string().optional(),
            price: z.string(),
            note: z.string().optional(),
          }),
        ),
      }),
      cta: z.object({
        heading: z.string(),
        body: z.string(),
        label: z.string(),
        target: z.string(),
      }),
    }),

    navigation: z.array(targetEntry),
  }),
})

const writing = defineCollection({
  type: 'page',
  source: 'writing/**',
  schema: z.object({
    title: z.string().min(1),
    category: z.enum(['Essay', 'Field notes', 'Opinion', 'Training', 'Build log']),
    date: datetimeOffset(),
    dek: z.string().optional(),
    excerpt: z.string().optional(),
    cover: z.string().optional(),
    readingTime: z.number().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
})

export default defineContentConfig({
  collections: { site, writing },
})
