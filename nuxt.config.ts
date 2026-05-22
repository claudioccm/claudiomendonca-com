// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-05-21',
  devtools: { enabled: true },

  modules: [
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/eslint',
  ],

  // Static generation (PRO-79 U7). `nuxt generate` pre-renders the site to
  // static HTML under `.output/public` — the dir netlify.toml publishes.
  // `ssr` is left at its default (true) so generate emits real pre-rendered
  // markup, not an empty SPA shell (an `ssr: false` SPA would fail a11y/SEO
  // and serve blank HTML to crawlers). The crawler already discovers both
  // routes via in-app links; the explicit `routes` list + `crawlLinks` make
  // that deterministic and self-documenting, so a future unlinked route still
  // needs to be added here on purpose rather than silently dropped.
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/consulting'],
    },
  },

  // Order matters: tokens.css must load before base.css so :root vars are
  // defined when base styles reference them via var(). chrome.css follows
  // base.css because it consumes the .shell, section, and .todo primitives.
  // sections.css comes last because it layers page-section + button atoms
  // on top of the chrome (precedent set in PRO-76 K1, continued in PRO-77 K1).
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/chrome.css',
    '~/assets/css/sections.css',
  ],

  // Motto® typography: Inter 500 for body, Oswald 500 for display.
  // No other weights, no italic variants. Fallback stacks live in tokens.css
  // via --font-sans / --font-disp.
  fonts: {
    families: [
      { name: 'Inter', weights: [500], styles: ['normal'] },
      { name: 'Oswald', weights: [500], styles: ['normal'] },
    ],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Claudio Mendonça — AI Experiments',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Personal site of Claudio Mendonça. AI experiments and client services.',
        },
      ],
    },
  },
})
