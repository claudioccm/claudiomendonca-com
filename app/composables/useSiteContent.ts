/**
 * Typed accessor for the `site` content collection (PRO-176).
 *
 * `content/site.json` is the single source of truth for all page copy
 * (home + consulting). It is modelled as a Nuxt Content `type: 'data'`
 * collection with one entry; this composable returns that entry, typed from
 * the Zod schema in `content.config.ts`.
 *
 * SSR / `nuxt generate` safe: `queryCollection` runs at prerender time and the
 * result is serialized into the static payload, so the copy ships in the
 * prerendered HTML (no client round-trip, no empty shell).
 *
 * Usage:
 *   const { data: site } = await useSiteContent()
 *   site.value?.intro.subhead
 */
export function useSiteContent() {
  return useAsyncData('site-content', () =>
    queryCollection('site').first(),
  )
}
