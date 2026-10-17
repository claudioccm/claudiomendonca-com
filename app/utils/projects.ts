// Project pages (/refs, 2026-10-17). Nuxt auto-imports app/utils/*.

// Content lives at content/projects/<slug>.md (path /projects/<slug>); the
// page is served from the site root: /<slug>.
export function projectRoute(contentPath: string): string {
  return `/${contentPath.split('/').filter(Boolean).pop() ?? ''}`
}

// Same slug, inverse: /refs → /projects/refs.
export function projectContentPath(route: string): string {
  return `/projects/${route.split('/').filter(Boolean).pop() ?? ''}`
}
