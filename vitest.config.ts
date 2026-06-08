import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

/**
 * Vitest config — PRO-95.
 *
 * Light-touch harness for two starter specs (see `tests/`). We deliberately
 * stay outside of `@nuxt/test-utils/runtime` here so the suite can run as
 * pure Vue component tests via `@vue/test-utils`. The two units under test
 * (`SiteNav.vue`'s `links` computed, `TypewriterHeadline.vue`'s reduced-motion
 * early-return) don't need the full Nuxt runtime to verify.
 *
 * The `~` alias mirrors Nuxt 4's auto-import root (`app/`).
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.spec.ts'],
  },
})
