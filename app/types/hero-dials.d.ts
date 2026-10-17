/**
 * Build-time flag (nuxt.config.ts `vite.define`): true on dev and Netlify deploy
 * previews, false on production builds, where the hero's `?dials` tuning panel
 * and its DialKit chunk are compiled out.
 */
declare const __HERO_DIALS__: boolean
