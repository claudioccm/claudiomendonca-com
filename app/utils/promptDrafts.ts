// Whether a build includes `draft: true` prompts (2026-10-16). Used at config
// time by content.config.ts and nuxt.config.ts (runtimeConfig.public
// .showPromptDrafts), so pass the build's env; never call it in the browser.
//
// - `nuxt dev` (NODE_ENV not production): yes, for local review.
// - Netlify deploy previews and branch deploys: yes, so Claudio can review
//   drafts on the preview URL. They render with a Draft badge and noindex.
// - Production (CONTEXT=production) and any production build without a
//   CONTEXT (e.g. a local `pnpm generate`): no. Drafts are then left out of the
//   collection entirely, so they never reach the public sql_dump either.
// The sitemap and llms.txt filter drafts in every context.

const PREVIEW_CONTEXTS = ['deploy-preview', 'branch-deploy']

export function includePromptDrafts(env: Record<string, string | undefined>): boolean {
  if (env.NODE_ENV !== 'production') return true
  return PREVIEW_CONTEXTS.includes(env.CONTEXT ?? '')
}
