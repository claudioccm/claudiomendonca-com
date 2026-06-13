/**
 * GSAP plugin — client only (PRO-109, KTD2).
 *
 * The `.client.ts` suffix keeps GSAP and its plugins out of the SSR / prerender
 * bundle entirely (`nuxt generate` never imports this file). Registering the
 * plugins here, once, means components and composables can `gsap.registerPlugin`
 * is already done — they just import gsap and use ScrollTrigger / SplitText.
 *
 * GSAP 3.13+ ships every plugin (incl. ScrollTrigger + SplitText) for free.
 *
 * Exposed as `$gsap` / `$ScrollTrigger` on the Nuxt app for typed access from
 * composables (e.g. useScrollReveal) and later-cycle components.
 */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText)

  return {
    provide: {
      gsap,
      ScrollTrigger,
      SplitText,
    },
  }
})
