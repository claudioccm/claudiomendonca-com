/**
 * Nuxt Content v3 collection definitions (PRO-176).
 *
 * Two collections:
 *   - `site`    — type 'data', single `content/site.json`. The live source of
 *                 truth for all page copy (home + consulting). Migrated from the
 *                 former interim `content/content.json`, enriched to carry the
 *                 exact field shape the components render (the work index rows
 *                 and the consulting offerings, which previously lived in
 *                 app/data/*.ts). Folding those arrays in here makes this file
 *                 the single source of truth (PRO-176 acceptance).
 *   - `writing` — type 'page', `content/writing/**`. Schema only for now; the
 *                 Writing index/posts land in PRO-178. The schema mirrors the
 *                 editorial taxonomy the redesign uses.
 *   - `prompts` — type 'page', `content/prompts/**`. The free prompt gallery
 *                 (/prompts). One file per prompt; the filename is the slug
 *                 (/prompts/<slug>). The Markdown body is optional extra notes.
 *                 The prompt text itself is copied, never rendered.
 *
 * Datetime convention: the `writing.date` field uses the shared
 * `datetimeOffset` helper (offset-tolerant ISO-8601) so both `Z`-suffixed UTC
 * and `±HH:MM` offset forms parse — matching the convention established in the
 * sibling `edge` repo's content.config.ts.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { includePromptDrafts } from './app/utils/promptDrafts'

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
      email: z.string(),
      social: z.array(linkEntry),
      elsewhere: z.array(linkEntry),
      // Client logos shared by the home and services heroes.
      trustedBy: z
        .object({
          label: z.string(),
          clients: z.array(z.object({
            name: z.string(),
            src: z.string(),
            width: z.number().positive(),
            height: z.number().positive(),
          })),
        })
        .optional(),
      copyright: z.string(),
    }),

    intro: z.object({
      headline: z.string(),
      subhead: z.string(),
      ctas: z.array(targetEntry),
      // Questions cycled by the home hero typewriter (HomeHero.vue). The headline
      // reads "<headline> <typewriter[i]>" — e.g. "Still chasing quotes?". SSR / no-JS /
      // reduced-motion render the first word statically. Optional → if unset the
      // hero shows the bare headline.
      typewriter: z.array(z.string()).optional(),
    }),

    problems: z.object({
      heading: z.string(),
      intro: z.string(),
      items: z.array(z.object({
        title: z.string(),
        description: z.string(),
      })),
      cta: targetEntry,
    }),

    about: z.object({
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
    }),

    work: z.object({
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
          // home Work index rows (ExperimentRow.vue). Falls back to `tag`
          // when unset.
          description: z.string().optional(),
          // Optional terser accessible name for the link; falls back to `title`.
          ariaLabel: z.string().optional(),
        }),
      ),
    }),

    consulting: z.object({
      headline: z.string(),
      subhead: z.string(),
      ctas: z.array(targetEntry),
      brief: z.object({
        heading: z.string(),
        paragraphs: z.array(z.string()),
      }),
      differentiator: z.object({
        heading: z.string(),
        paragraphs: z.array(z.string()),
        startingPoint: z.object({
          label: z.string(),
          note: z.string(),
        }),
      }),
      offerings: z.object({
        heading: z.string(),
        items: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            tagline: z.string(),
            blurb: z.string(),
            outcomes: z.array(z.string()),
          }),
        ),
      }),
      process: z.object({
        heading: z.string(),
        steps: z.array(
          z.object({
            title: z.string(),
            body: z.string(),
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

/** Categories for the prompt gallery filter chips (/prompts). */
const PROMPT_CATEGORIES = ['Quotes & sales', 'Customer messages', 'On the job', 'Admin'] as const

// Production builds leave `draft: true` prompts out of the collection entirely.
// A `where('draft', '=', false)` filter alone is not enough: @nuxt/content ships
// every document in the public /__nuxt_content/<collection>/sql_dump.txt, so a
// filtered draft would still be downloadable. `nuxt dev` and Netlify previews
// keep them for review (see app/utils/promptDrafts.ts).
function draftPromptFiles(): string[] {
  if (includePromptDrafts(process.env)) return []
  try {
    return readdirSync('content/prompts')
      .filter(f => f.endsWith('.md'))
      .filter(f => /^draft:\s*true\s*$/m.test(readFileSync(`content/prompts/${f}`, 'utf8')))
      .map(f => `prompts/${f}`)
  }
  catch {
    return []
  }
}

const prompts = defineCollection({
  type: 'page',
  source: { include: 'prompts/**', exclude: draftPromptFiles() },
  schema: z.object({
    title: z.string().min(1),
    // One line: what the prompt does. Used on the card, the page dek and meta.
    description: z.string().min(1),
    category: z.enum(PROMPT_CATEGORIES),
    // Who it is for (trade / role), shown in the card and page meta.
    audience: z.string().min(1),
    // The copy-paste prompt(s), in the order they are used. Copied to the
    // clipboard only; the text is never rendered on the site (Claudio,
    // 2026-10-16). `[BRACKETS]` mark the parts to swap; `label` names each one.
    prompts: z.array(z.object({
      label: z.string().optional(),
      text: z.string().min(1),
    })).min(1),
    // "How to use it" steps.
    steps: z.array(z.string()).default([]),
    // The honest caveat ("AI drafts. You sign.").
    check: z.string().optional(),
    // "That's the DIY version." line: what the built version does. Feeds the
    // closing CTA to /consulting.
    builtVersion: z.string().optional(),
    // Instagram comment keyword that sends people to this page.
    keyword: z.string().optional(),
    // Instagram post the prompt was transcribed from, if any.
    sourcePost: z.string().optional(),
    date: datetimeOffset(),
    draft: z.boolean().default(false),
  }),
})

export default defineContentConfig({
  collections: { site, writing, prompts },
})
