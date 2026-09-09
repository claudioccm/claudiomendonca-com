/**
 * Dynamic llms.txt, prerendered to a static /llms.txt on `nuxt generate`.
 *
 * The llmstxt.org convention: a curated, link-rich Markdown summary that gives
 * LLMs / answer engines (GEO — generative engine optimization) a high-signal
 * map of the site. The framing copy is hand-written; the Work and
 * Writing link lists are pulled from the same content layer the pages render,
 * so they never drift from the site. Listed in nitro.prerender.routes; Netlify
 * serves it as text/plain by extension.
 */
import { queryCollection } from '@nuxt/content/server'

const BASE = 'https://claudiomendonca.com'

/** Oxford-comma list join — "a, b, and c" — for the prose intro line. */
function formatList(items: string[]): string {
  if (items.length < 2) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

function monthYear(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  // Pin UTC so the month matches the sitemap lastmod, the article timestamps,
  // and the site's own formatMonthYear util (which also pins UTC) — otherwise a
  // Z-midnight date drifts to the previous month in a behind-UTC build host.
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export default defineEventHandler(async (event) => {
  const site = await queryCollection(event, 'site').first()
  const posts = await queryCollection(event, 'writing')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all()

  const identity = site?.identity
  const work = site?.work.items ?? []

  const lines: string[] = [
    '# Claudio Mendonça',
    '',
    '> Design engineer with fifteen years of practice, building AI systems that run in production. Ships his own AI products under his own name and runs a consulting practice that turns clients’ recurring documents, reports, and newsletters into accountable, on-brand systems, and trains the teams who operate them.',
    '',
    `${identity?.name ?? 'Claudio Mendonça'} is a founder, designer, and engineer based in ${identity?.location ?? 'British Columbia, Canada'}, with fifteen years of design and engineering practice${identity?.trustedBy ? ` and work for teams at ${formatList(identity.trustedBy.names)}` : ''}. This site is the index to his work: AI systems built and run under his own name, a consulting practice for research nonprofits, foundations, think tanks, and small expert teams, and writing about building AI systems that hold up in production. Available for a small number of engagements at a time.`,
    '',
    '## Work',
    '',
    ...work.map(e => `- [${e.title}](${e.url}): ${e.description ?? e.tag}`),
    '',
    '## Consulting',
    '',
    `- [Consulting](${BASE}/consulting): ${site?.consulting.subhead ?? 'Systems that produce a team’s recurring documents and reports on schedule and on-brand, plus training so they work with AI on everything else.'}`,
    '',
    '## Writing',
    '',
    ...posts.map((p) => {
      const my = monthYear(p.date)
      const dek = p.dek ? ` — ${p.dek}` : ''
      return `- [${p.title}](${BASE}${p.path})${my ? ` (${my})` : ''}${dek}`
    }),
    '',
    '## Contact',
    '',
    `- Email: ${identity?.email ?? 'claudioccm@gmail.com'}`,
    `- Location: ${identity?.location ?? 'British Columbia, Canada'}`,
    `- Web: ${BASE}/`,
    '',
  ]

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return lines.join('\n')
})
