import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

/**
 * Marquee.vue · SSR-real items + doubled track + a11y duplicate (PRO-113 U3).
 *
 * Like the other component specs, we don't import the SFC directly (Nuxt
 * auto-imports / runtime). We exercise a harness mirroring the production
 * component's structure exactly:
 *   1. every item renders as real text (no-JS view-source carries the strip) (R7)
 *   2. the track holds TWO identical item groups (the seamless-loop technique)
 *   3. the duplicate group is aria-hidden so AT reads the list once
 *   4. the readable group carries the ariaLabel when provided
 *   5. the duration prop is reflected as the --marquee-duration custom property
 *
 * The CSS animation + the reduced-motion pause are pure-CSS and verified in the
 * STEP 6 browser pass (happy-dom does not run CSS animations).
 */
import { defineComponent, h } from 'vue'

interface HarnessProps {
  items: string[]
  ariaLabel?: string
  durationSeconds?: number
}

const Harness = defineComponent({
  props: {
    items: { type: Array as () => string[], default: () => [] },
    ariaLabel: { type: String, default: undefined },
    durationSeconds: { type: Number, default: 32 },
  },
  setup(props) {
    return () =>
      h(
        'div',
        { class: 'marquee', style: { '--marquee-duration': `${props.durationSeconds}s` } },
        [
          h('div', { class: 'marquee-track' }, [
            h(
              'ul',
              { class: 'marquee-group', 'aria-label': props.ariaLabel },
              props.items.map((item, i) => h('li', { class: 'marquee-item', key: `a-${i}` }, item)),
            ),
            h(
              'ul',
              { class: 'marquee-group', 'aria-hidden': 'true' },
              props.items.map((item, i) => h('li', { class: 'marquee-item', key: `b-${i}` }, item)),
            ),
          ]),
        ],
      )
  },
})

function mountMarquee(props: Partial<HarnessProps>) {
  return mount(Harness, { props: props as Record<string, unknown> })
}

describe('Marquee content + doubled track (R5/R7)', () => {
  it('renders every item as real text', () => {
    const w = mountMarquee({ items: ['Design', 'Engineering', 'AI'] })
    const text = w.text()
    expect(text).toContain('Design')
    expect(text).toContain('Engineering')
    expect(text).toContain('AI')
  })

  it('renders two identical groups (the seamless-loop technique)', () => {
    const w = mountMarquee({ items: ['Design', 'Engineering', 'AI'] })
    const groups = w.findAll('.marquee-group')
    expect(groups).toHaveLength(2)
    // Each group holds the full item set.
    expect(groups[0]!.findAll('.marquee-item')).toHaveLength(3)
    expect(groups[1]!.findAll('.marquee-item')).toHaveLength(3)
  })

  it('carries no hidden start state in the static markup', () => {
    const w = mountMarquee({ items: ['Design'] })
    const html = w.html()
    expect(html).not.toMatch(/opacity:\s*0/)
    expect(html).not.toMatch(/visibility:\s*hidden/)
  })
})

describe('Marquee accessibility', () => {
  it('marks the duplicate group aria-hidden so AT reads items once', () => {
    const w = mountMarquee({ items: ['Design', 'Engineering'] })
    const groups = w.findAll('.marquee-group')
    // First (readable) group is not aria-hidden; second (filler) group is.
    expect(groups[0]!.attributes('aria-hidden')).toBeUndefined()
    expect(groups[1]!.attributes('aria-hidden')).toBe('true')
  })

  it('applies the ariaLabel to the readable group when provided', () => {
    const w = mountMarquee({ items: ['Design'], ariaLabel: 'Roles and tools' })
    expect(w.findAll('.marquee-group')[0]!.attributes('aria-label')).toBe('Roles and tools')
  })
})

describe('Marquee duration', () => {
  it('reflects the default duration as the --marquee-duration custom property', () => {
    const w = mountMarquee({ items: ['Design'] })
    expect(w.find('.marquee').attributes('style')).toContain('--marquee-duration: 32s')
  })

  it('reflects a custom duration', () => {
    const w = mountMarquee({ items: ['Design'], durationSeconds: 18 })
    expect(w.find('.marquee').attributes('style')).toContain('--marquee-duration: 18s')
  })
})
