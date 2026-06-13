import { onMounted, onScopeDispose, unref, type Ref } from 'vue'
import { useReducedMotion } from './useReducedMotion'

export interface ScrollRevealOptions {
  /** Pixels the element travels up into place. Default 24. */
  y?: number
  /** Tween duration in seconds. Default 0.8. */
  duration?: number
  /** Stagger between matched children, in seconds. Default 0 (single element). */
  stagger?: number
  /** ScrollTrigger `start`. Default 'top 85%'. */
  start?: string
  /** Optional selector for staggered children inside the target. */
  childSelector?: string
}

type MaybeElementRef = Ref<HTMLElement | null | undefined> | HTMLElement | null | undefined

/**
 * useScrollReveal — progressive-enhancement scroll reveal (PRO-109, R9 + KTD3).
 *
 * Contract:
 *   - SSR / no-JS: this composable is a no-op. It never sets a hidden start
 *     state, so server-rendered content stays VISIBLE (no-JS view-source has
 *     full content; no flash-of-hidden-content). The hidden state is applied
 *     only in onMounted on the client.
 *   - prefers-reduced-motion: leave the element visible, skip the animation.
 *   - otherwise: set a hidden start state, then a ScrollTrigger reveals it when
 *     it scrolls into view.
 *
 * GSAP is dynamically imported inside onMounted so it never enters the SSR graph
 * (KTD2). The created ScrollTrigger is killed on scope dispose.
 */
export function useScrollReveal(target: MaybeElementRef, options: ScrollRevealOptions = {}) {
  const { y = 24, duration = 0.8, stagger = 0, start = 'top 85%', childSelector } = options
  const reduced = useReducedMotion()

  // Guarded so the composable is inert if ever invoked outside a component setup
  // (e.g. server data fetch) — onMounted only fires on the client.
  let cleanup: (() => void) | undefined

  onMounted(async () => {
    if (reduced.value) return // reduced motion: stay visible, no animation

    const el = unref(target)
    if (!el) return

    const targets = childSelector ? el.querySelectorAll(childSelector) : el

    const { gsap } = await import('gsap')
    const { ScrollTrigger } = await import('gsap/ScrollTrigger')
    gsap.registerPlugin(ScrollTrigger)

    // Hidden start state applied on the CLIENT only (KTD3).
    gsap.set(targets, { opacity: 0, y })

    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
      },
    })

    cleanup = () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  })

  onScopeDispose(() => {
    cleanup?.()
  })
}
