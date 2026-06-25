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

  // /about is not a page — About lives as a section on the home page
  // (#about). This redirect catches direct hits to /about in dev and any
  // server runtime. The static Netlify deploy doesn't run Nitro, so the
  // same rule is mirrored in public/_redirects for production.
  routeRules: {
    '/about': { redirect: { to: '/#about', statusCode: 301 } },
  },

  // Order matters: tokens.css must load before base.css so :root vars are
  // defined when base styles reference them via var(). chrome.css follows
  // base.css because it consumes the .shell and section primitives.
  // sections.css comes last because it layers page-section + button atoms
  // on top of the chrome (precedent set in PRO-76 K1, continued in PRO-77 K1).
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
    '~/assets/css/chrome.css',
    '~/assets/css/sections.css',
  ],

  // Typography (Redesign v2, PRO-175): Instrument Serif 400 (normal + italic)
  // for display headlines, JetBrains Mono 400/500 for body, nav, mono accents.
  // Fallback stacks live in tokens.css via --font-disp / --font-sans / --font-mono.
  fonts: {
    families: [
      { name: 'Instrument Serif', weights: [400], styles: ['normal', 'italic'] },
      { name: 'JetBrains Mono', weights: [400, 500], styles: ['normal'] },
    ],
  },

  app: {
    // Page transition (PRO-109, KTD5). The `.page-*` CSS lives in base.css and
    // is removed under prefers-reduced-motion, so the route swap is instant for
    // reduced-motion users. Generate-safe — works with `nuxt generate`.
    pageTransition: { name: 'page', mode: 'out-in' },

    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Claudio Mendonça — AI Experiments',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Personal site of Claudio Mendonça. AI experiments and client services.',
        },
        // Canonical / Open Graph base for https://claudiomendonca.com.
        // Per-route canonical + og:url are set in each page via useSeoMeta;
        // these site-wide og defaults reuse the title/description above.
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Claudio Mendonça' },
        { property: 'og:title', content: 'Claudio Mendonça — AI Experiments' },
        {
          property: 'og:description',
          content: 'Personal site of Claudio Mendonça. AI experiments and client services.',
        },
      ],

      // Google Analytics 4 (gtag.js) — property G-N2W2CXJ5JE.
      // Site-wide; rendered into every prerendered page's <head> by `nuxt generate`.
      script: [
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-N2W2CXJ5JE',
          async: true,
        },
        {
          innerHTML: [
            'window.dataLayer = window.dataLayer || [];',
            'function gtag(){dataLayer.push(arguments);}',
            "gtag('js', new Date());",
            "gtag('config', 'G-N2W2CXJ5JE');",
          ].join(''),
        },
      ],
    },
  },
})
