/**
 * Lenis smooth-scroll plugin — client only (PRO-109, KTD2 + KTD4).
 *
 * Runs after gsap.client.ts (Nuxt loads plugins in alphabetical filename order,
 * so `gsap` < `lenis` — ScrollTrigger is registered before we wire it here).
 *
 * Capability gate (KTD4 / R13): Lenis hijacks native scrolling, which is hostile
 * on touch devices and for reduced-motion users. When `prefers-reduced-motion:
 * reduce` OR `(pointer: coarse)` matches, we do NOT instantiate Lenis — the page
 * uses native scroll and ScrollTrigger falls back to the default scroller.
 *
 * When enabled, Lenis drives ScrollTrigger via the GSAP ticker (single RAF loop),
 * and ScrollTrigger.update fires on every Lenis scroll event.
 *
 * Exposes `$lenis` (the instance, or null when gated off) for SmoothScroll /
 * composables that want to call `lenis.scrollTo(...)`.
 */
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default defineNuxtPlugin(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches

  // Gated: native scroll, no Lenis. Still provide a null instance so consumers
  // can feature-detect without guarding for undefined.
  if (prefersReducedMotion || isCoarsePointer) {
    return {
      provide: { lenis: null as Lenis | null },
    }
  }

  const lenis = new Lenis({ autoRaf: false })

  // Keep ScrollTrigger in sync with Lenis-driven scroll position.
  lenis.on('scroll', ScrollTrigger.update)

  // Single RAF loop via the GSAP ticker (avoids a competing rAF loop).
  const tickerCallback = (time: number) => {
    // GSAP ticker time is in seconds; Lenis expects milliseconds.
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(tickerCallback)
  gsap.ticker.lagSmoothing(0)

  // Clean up the ticker callback + Lenis on HMR dispose so a dev reload doesn't
  // stack RAF loops.
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
    })
  }

  return {
    provide: { lenis },
  }
})
