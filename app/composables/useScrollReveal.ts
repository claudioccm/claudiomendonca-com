import type { Ref } from 'vue'

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
 * useScrollReveal — retired no-op (PRO-174).
 *
 * The GSAP/ScrollTrigger scroll reveal was removed with the rest of the motion
 * stack. Scroll reveals are now driven entirely by CSS: tag an element with
 * `data-reveal` and the `[data-reveal]` rule in app/assets/css/base.css fades
 * it in via a scroll-linked View Timeline (guarded by `@supports` +
 * `prefers-reduced-motion: no-preference`, so no-JS / reduced-motion /
 * unsupported browsers keep the fully-visible default).
 *
 * This composable is kept as an inert no-op so existing call sites continue to
 * compile without churn and the exported `ScrollRevealOptions` type stays
 * available. It performs no work, registers no listeners, and imports nothing
 * from the removed libraries.
 */
export function useScrollReveal(_target: MaybeElementRef, _options: ScrollRevealOptions = {}): void {
  // Intentionally empty — reveals are CSS-driven via [data-reveal]. See above.
}
