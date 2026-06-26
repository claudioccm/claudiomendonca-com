/**
 * Dynamic sitemap, prerendered to a static /sitemap.xml on `nuxt generate`.
 *
 * Hand-rolled rather than pulling in @nuxtjs/sitemap — the route queries the
 * `writing` collection server-side via @nuxt/content's server API, so new posts
 * appear automatically and each post's <lastmod> comes from its frontmatter
 * date. The static pages (/, /consulting, /writing) carry the newest post date
 * as a stable, content-derived lastmod. Listed in nitro.prerender.routes so it
 * emits as a static file; Netlify serves it as application/xml by extension.
 * URLs mirror the canonical URLs the pages set (no trailing slash but the root).
 * Referenced from public/robots.txt.
 */
import { queryCollection } from '@nuxt/content/server'

const BASE = 'https://claudiomendonca.com'

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

function toIso(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toISOString()
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default defineEventHandler(async (event) => {
  const posts = await queryCollection(event, 'writing')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all()

  const newest = posts.length ? toIso(posts[0]!.date) : undefined

  const entries: SitemapEntry[] = [
    { loc: `${BASE}/`, lastmod: newest, changefreq: 'monthly', priority: '1.0' },
    { loc: `${BASE}/consulting`, lastmod: newest, changefreq: 'monthly', priority: '0.8' },
    { loc: `${BASE}/writing`, lastmod: newest, changefreq: 'weekly', priority: '0.8' },
    ...posts.map((p): SitemapEntry => ({
      loc: `${BASE}${p.path}`,
      lastmod: toIso(p.date),
      changefreq: 'yearly',
      priority: '0.6',
    })),
  ]

  const urls = entries
    .map((e) => {
      const parts = [`    <loc>${xmlEscape(e.loc)}</loc>`]
      if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`)
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`)
      if (e.priority) parts.push(`    <priority>${e.priority}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
