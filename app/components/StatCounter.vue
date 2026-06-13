<!--
  StatCounter — animated number + SVG arc for a single credibility stat
  (PRO-113, U2). First used for the MIT "95%" stat in the /consulting
  "Not just a chatbot" block.

  SSR / no-JS / reduced-motion render the FINAL state as real markup: the
  literal target number (e.g. "95") + suffix, and the SVG arc drawn at its
  full sweep. So view-source carries "95%" and the caption/citation, with no
  hidden start state (PRO-109 R7). The accessible label always reads the final
  value, never "0".

  On the client, when motion is allowed, onMounted ENHANCES that static state:
  it sets the start state (number → 0, arc offset → full = hidden), then a
  ScrollTrigger fires ONCE when the figure scrolls into view to count the
  number up and sweep the arc into place.

  GSAP is provided client-only via app/plugins/gsap.client.ts ($gsap /
  $ScrollTrigger); we never import gsap at module scope, so it stays out of the
  SSR / prerender bundle (mirrors KineticHeading.vue / useScrollReveal.ts).

  Visual rules (.stat-counter*) live in app/assets/css/sections.css; only the
  animation-critical SVG geometry (dasharray/dashoffset) is computed here.
-->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

interface Props {
  /** Target value the number counts up to (e.g. 95). */
  value: number
  /** Unit shown after the number. Defaults to '%'. */
  suffix?: string
  /** Short label under the number (e.g. "of AI pilots stall"). */
  label?: string
  /** Accessible name for the figure. Defaults to "<value><suffix> <label>". */
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  suffix: '%',
  label: undefined,
  ariaLabel: undefined,
})

const reduced = useReducedMotion()

// Arc geometry. The ring is a circle of radius R; the foreground arc is drawn
// with stroke-dasharray = circumference and a stroke-dashoffset that exposes
// `fraction` of the ring. Final (SSR/default) state shows the full sweep.
const R = 52
const CIRC = 2 * Math.PI * R
const fraction = computed(() => Math.max(0, Math.min(1, props.value / 100)))
// Offset for the FINAL state (how much of the ring stays hidden at the target).
const targetOffset = computed(() => CIRC * (1 - fraction.value))

const accessibleName = computed(
  () => props.ariaLabel ?? `${props.value}${props.suffix}${props.label ? ` ${props.label}` : ''}`,
)

// Refs for the client enhancement. The number node text is rewritten on each
// tween frame; the arc's stroke-dashoffset is animated.
const numEl = ref<HTMLElement | null>(null)
const arcEl = ref<SVGCircleElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)

// Tweens carry their own ScrollTrigger (killed via tween.scrollTrigger on
// teardown). We keep handles to both so unmount fully cleans up — page
// transitions are out-in, so the DOM must be left clean for the next mount.
let countTween: { kill: () => void, scrollTrigger?: { kill: () => void } } | null = null
let arcTween: { kill: () => void, scrollTrigger?: { kill: () => void } } | null = null
let cancelled = false

onMounted(() => {
  // Reduced motion: leave the final static state (number + full arc) untouched.
  if (reduced.value) return

  const { $gsap, $ScrollTrigger } = useNuxtApp() as unknown as {
    $gsap?: typeof import('gsap')['gsap']
    $ScrollTrigger?: typeof import('gsap/ScrollTrigger')['ScrollTrigger']
  }
  if (!$gsap || !rootEl.value) return

  // Start state applied on the CLIENT only (R7): number → 0, arc fully hidden.
  if (numEl.value) numEl.value.textContent = '0'
  if (arcEl.value) $gsap.set(arcEl.value, { strokeDashoffset: CIRC })

  // A shared ScrollTrigger config so the count + sweep fire together, once,
  // when the figure scrolls into view. If the plugin is missing, the tweens
  // play immediately on mount (still an enhancement over the static state).
  const st = $ScrollTrigger
    ? { trigger: rootEl.value, start: 'top 85%', once: true }
    : undefined

  const counter = { v: 0 }
  countTween = $gsap.to(counter, {
    v: props.value,
    duration: 1.6,
    ease: 'power2.out',
    onUpdate: () => {
      if (numEl.value) numEl.value.textContent = String(Math.round(counter.v))
    },
    onComplete: () => {
      // Snap to the exact target in case of rounding drift.
      if (numEl.value) numEl.value.textContent = String(props.value)
    },
    scrollTrigger: st,
  })

  if (arcEl.value) {
    arcTween = $gsap.to(arcEl.value, {
      strokeDashoffset: targetOffset.value,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: st,
    })
  }

  // Mounted-then-immediately-unmounted (fast route change): tear down now.
  if (cancelled) {
    countTween?.scrollTrigger?.kill()
    countTween?.kill()
    arcTween?.scrollTrigger?.kill()
    arcTween?.kill()
  }
})

onBeforeUnmount(() => {
  cancelled = true
  countTween?.scrollTrigger?.kill()
  countTween?.kill()
  arcTween?.scrollTrigger?.kill()
  arcTween?.kill()
})
</script>

<template>
  <figure
    ref="rootEl"
    class="stat-counter"
    role="figure"
    :aria-label="accessibleName"
  >
    <div class="stat-counter-dial">
      <svg
        class="stat-counter-arc"
        viewBox="0 0 120 120"
        aria-hidden="true"
        focusable="false"
      >
        <circle class="stat-counter-ring" cx="60" cy="60" :r="R" fill="none" />
        <circle
          ref="arcEl"
          class="stat-counter-progress"
          cx="60"
          cy="60"
          :r="R"
          fill="none"
          :stroke-dasharray="CIRC"
          :stroke-dashoffset="targetOffset"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <span class="stat-counter-value" aria-hidden="true">
        <span ref="numEl" class="stat-num">{{ value }}</span><span class="stat-suffix">{{ suffix }}</span>
      </span>
    </div>
    <figcaption v-if="label || $slots.default" class="stat-counter-caption">
      <span v-if="label" class="stat-counter-label">{{ label }}</span>
      <slot />
    </figcaption>
  </figure>
</template>
