import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

/**
 * StatCounter.vue · final-value SSR markup + arc geometry + a11y (PRO-113 U2).
 *
 * Like ExperimentCard.spec.ts / MagneticButton.spec.ts, we don't import the SFC
 * directly — it depends on Nuxt auto-imports (useNuxtApp/$gsap, useReducedMotion)
 * and a Nuxt runtime. Instead we exercise a harness that mirrors the production
 * component's load-bearing, non-GSAP logic exactly:
 *   1. SSR/default renders the FINAL value + suffix as real text (never "0")
 *   2. the SVG arc renders at its FINAL offset (full sweep) — no hidden start
 *      state in the static markup (R7)
 *   3. the accessible name reads "<value><suffix> <label>" (the final value)
 *   4. default suffix is '%'; a custom suffix renders instead
 *   5. the label + caption slot content render
 *
 * The GSAP count-up + arc sweep are client-only onMounted effects that bail on
 * the server and under reduced-motion; they are verified in the STEP 6 browser
 * pass, not here (happy-dom has no scroll/layout for ScrollTrigger to act on).
 */
import { defineComponent, h, computed } from 'vue'

const R = 52
const CIRC = 2 * Math.PI * R

interface HarnessProps {
  value: number
  suffix?: string
  label?: string
  ariaLabel?: string
}

const Harness = defineComponent({
  props: {
    value: { type: Number, default: 95 },
    suffix: { type: String, default: '%' },
    label: { type: String, default: undefined },
    ariaLabel: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    // EXACT mirror of StatCounter.vue's derived values.
    const fraction = computed(() => Math.max(0, Math.min(1, props.value / 100)))
    const targetOffset = computed(() => CIRC * (1 - fraction.value))
    const accessibleName = computed(
      () => props.ariaLabel ?? `${props.value}${props.suffix}${props.label ? ` ${props.label}` : ''}`,
    )

    return () =>
      h(
        'figure',
        { class: 'stat-counter', role: 'figure', 'aria-label': accessibleName.value },
        [
          h('div', { class: 'stat-counter-dial' }, [
            h('svg', { class: 'stat-counter-arc', viewBox: '0 0 120 120', 'aria-hidden': 'true' }, [
              h('circle', { class: 'stat-counter-ring', cx: 60, cy: 60, r: R, fill: 'none' }),
              h('circle', {
                class: 'stat-counter-progress',
                cx: 60,
                cy: 60,
                r: R,
                fill: 'none',
                'stroke-dasharray': CIRC,
                'stroke-dashoffset': targetOffset.value,
              }),
            ]),
            h('span', { class: 'stat-counter-value', 'aria-hidden': 'true' }, [
              h('span', { class: 'stat-num' }, String(props.value)),
              h('span', { class: 'stat-suffix' }, props.suffix),
            ]),
          ]),
          props.label || slots.default
            ? h('figcaption', { class: 'stat-counter-caption' }, [
                props.label ? h('span', { class: 'stat-counter-label' }, props.label) : null,
                slots.default ? slots.default() : null,
              ])
            : null,
        ],
      )
  },
})

function mountStat(props: Partial<HarnessProps>, slot?: string) {
  return mount(Harness, {
    props: props as Record<string, unknown>,
    slots: slot ? { default: slot } : undefined,
  })
}

describe('StatCounter final-value SSR markup (R4/R7)', () => {
  it('renders the final value and suffix as real text (not "0")', () => {
    const w = mountStat({ value: 95, suffix: '%' })
    expect(w.find('.stat-num').text()).toBe('95')
    expect(w.find('.stat-suffix').text()).toBe('%')
    // The literal target must be in the static markup for no-JS view-source (R7).
    expect(w.text()).toContain('95')
  })

  it('defaults the suffix to "%" and honors a custom suffix', () => {
    expect(mountStat({ value: 2 }).find('.stat-suffix').text()).toBe('%')
    expect(mountStat({ value: 2, suffix: 'x' }).find('.stat-suffix').text()).toBe('x')
  })

  it('carries no hidden start state in the static markup', () => {
    const w = mountStat({ value: 95 })
    const html = w.html()
    expect(html).not.toMatch(/opacity:\s*0/)
    expect(html).not.toMatch(/visibility:\s*hidden/)
  })
})

describe('StatCounter SVG arc geometry (R4)', () => {
  it('draws the arc at its FINAL offset (full sweep) in static markup', () => {
    const w = mountStat({ value: 95 })
    const arc = w.find('.stat-counter-progress')
    expect(arc.exists()).toBe(true)
    // dasharray = full circumference; dashoffset = the target (final) offset,
    // i.e. CIRC * (1 - 0.95) — NOT the full circumference (which would mean a
    // hidden/empty ring in the served HTML).
    const dasharray = Number(arc.attributes('stroke-dasharray'))
    const dashoffset = Number(arc.attributes('stroke-dashoffset'))
    expect(dasharray).toBeCloseTo(CIRC, 3)
    expect(dashoffset).toBeCloseTo(CIRC * (1 - 0.95), 3)
    expect(dashoffset).toBeLessThan(CIRC)
  })

  it('clamps the fraction so values >100 do not over-sweep', () => {
    const w = mountStat({ value: 150 })
    const dashoffset = Number(w.find('.stat-counter-progress').attributes('stroke-dashoffset'))
    // fraction clamps to 1 → offset 0 (full ring), never negative.
    expect(dashoffset).toBeCloseTo(0, 3)
  })
})

describe('StatCounter accessibility + caption', () => {
  it('exposes the final value in the accessible name, not "0"', () => {
    const w = mountStat({ value: 95, suffix: '%', label: 'of AI pilots stall' })
    expect(w.find('figure').attributes('aria-label')).toBe('95% of AI pilots stall')
  })

  it('honors an explicit ariaLabel override', () => {
    const w = mountStat({ value: 95, ariaLabel: 'Ninety-five percent' })
    expect(w.find('figure').attributes('aria-label')).toBe('Ninety-five percent')
  })

  it('renders the label and the caption slot content', () => {
    const w = mountStat({ value: 95, label: 'of AI pilots stall' }, '<cite>— MIT, 2025</cite>')
    expect(w.find('.stat-counter-label').text()).toBe('of AI pilots stall')
    expect(w.text()).toContain('MIT, 2025')
  })
})
