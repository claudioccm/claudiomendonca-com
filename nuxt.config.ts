// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-05-21',
  devtools: { enabled: true },

  modules: [
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/eslint',
  ],

  // Order matters: tokens.css must load before base.css so :root vars are
  // defined when base styles reference them via var(). chrome.css follows
  // base.css because it consumes the .shell, section, and .todo primitives.
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/chrome.css',
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
