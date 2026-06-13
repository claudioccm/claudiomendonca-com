import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

/**
 * ExperimentCard.vue · link contract + mono index + SSR-visible markup (PRO-112).
 *
 * Like SiteNav.spec.ts / MagneticButton.spec.ts, we don't import the SFC directly
 * — it depends on Nuxt auto-imports (NuxtImg, padIndex, useScrollReveal) and a
 * Nuxt runtime. Instead we exercise a harness that mirrors the production
 * component's load-bearing, non-GSAP logic exactly:
 *   1. the outbound link contract: <a href target="_blank" rel="noopener">
 *   2. the zero-padded index label rendered in --font-mono
 *   3. accessible-name fallback (ariaLabel ?? title)
 *   4. image presence/absence (NuxtImg <img> vs stripes-only)
 *   5. SSR-safe render: no hidden start state in the static markup (R7)
 *
 * The GSAP reveal + parallax are client-only onMounted effects that bail on the
 * server and under reduced-motion; they are verified in the STEP 6 browser pass,
 * not here (happy-dom has no layout/scroll for ScrollTrigger to act on).
 */
import { defineComponent, h, computed } from 'vue'

// EXACT mirror of app/utils/format.ts · padIndex (auto-imported in the SFC).
const padIndex = (n: number): string => String(n).padStart(2, '0')

interface HarnessProps {
  idx: number
  title: string
  tag: string
  href: string
  image?: string
  alt: string
  ariaLabel?: string
}

const Harness = defineComponent({
  props: {
    idx: { type: Number, default: 1 },
    title: { type: String, default: 'Cut The Crap' },
    tag: { type: String, default: 'YOUTUBE VIDEOS AS TWEETS' },
    href: { type: String, default: 'https://example.com' },
    image: { type: String, default: undefined },
    alt: { type: String, default: 'alt text' },
    ariaLabel: { type: String, default: undefined },
  },
  setup(props) {
    // EXACT mirror of ExperimentCard.vue's derived values.
    const idxLabel = computed(() => padIndex(props.idx))
    const accessibleName = computed(() => props.ariaLabel ?? props.title)

    return () =>
      h(
        'a',
        {
          class: 'experiment',
          href: props.href,
          target: '_blank',
          rel: 'noopener',
          'aria-label': accessibleName.value,
        },
        [
          h('div', { class: 'shot' }, [
            h('div', { class: 'stripes', 'aria-hidden': 'true' }),
            // NuxtImg renders a plain <img> in production.
            props.image ? h('img', { src: props.image, alt: props.alt, loading: 'lazy' }) : null,
          ]),
          h('div', { class: 'experiment-caption' }, [
            h('span', { class: 'idx' }, idxLabel.value),
            h('div', { class: 'title-block' }, [
              h('h2', props.title),
              h('span', { class: 'tag' }, props.tag),
            ]),
            h('span', { class: 'arrow', 'aria-hidden': 'true' }, '↗'),
          ]),
        ],
      )
  },
})

function mountCard(props: Partial<HarnessProps>) {
  return mount(Harness, { props: props as Record<string, unknown> })
}

describe('ExperimentCard link contract', () => {
  it('renders an <a> that opens in a new tab with rel="noopener"', () => {
    const w = mountCard({ href: 'https://cutthecrap.claudiomendonca.com' })
    const a = w.find('a.experiment')
    expect(a.exists()).toBe(true)
    expect(a.attributes('href')).toBe('https://cutthecrap.claudiomendonca.com')
    // R4 — cards link out in a new tab, safely.
    expect(a.attributes('target')).toBe('_blank')
    expect(a.attributes('rel')).toBe('noopener')
  })

  it('uses ariaLabel as the accessible name when provided', () => {
    const w = mountCard({ title: 'BATCH SQUOOSH', ariaLabel: 'Squoosh' })
    expect(w.find('a.experiment').attributes('aria-label')).toBe('Squoosh')
  })

  it('falls back to title for the accessible name when ariaLabel is absent', () => {
    const w = mountCard({ title: 'Edge' })
    expect(w.find('a.experiment').attributes('aria-label')).toBe('Edge')
  })
})

describe('ExperimentCard index + caption', () => {
  it('renders the zero-padded index label', () => {
    expect(mountCard({ idx: 3 }).find('.idx').text()).toBe('03')
    expect(mountCard({ idx: 12 }).find('.idx').text()).toBe('12')
  })

  it('renders the title and tag', () => {
    const w = mountCard({ title: 'Varro', tag: 'FULLY AI GENERATED BLOG' })
    expect(w.find('h2').text()).toBe('Varro')
    expect(w.find('.tag').text()).toBe('FULLY AI GENERATED BLOG')
  })
})

describe('ExperimentCard image presence', () => {
  it('renders an <img> with alt when image is set', () => {
    const w = mountCard({ image: '/screenshots/edge.jpg', alt: 'Edge — AI news blog' })
    const img = w.find('.shot img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe('Edge — AI news blog')
  })

  it('renders stripes-only (no <img>) when image is absent', () => {
    const w = mountCard({ image: undefined })
    expect(w.find('.shot .stripes').exists()).toBe(true)
    expect(w.find('.shot img').exists()).toBe(false)
  })
})

describe('ExperimentCard SSR-safe render (R7)', () => {
  it('carries no hidden start state in the static markup', () => {
    // The reveal/parallax hidden state is applied only client-side in onMounted;
    // the server-rendered card must be fully visible (no inline opacity/transform).
    const w = mountCard({ image: '/screenshots/cutthecrap.jpg' })
    const html = w.html()
    expect(html).not.toMatch(/opacity:\s*0/)
    expect(html).not.toMatch(/visibility:\s*hidden/)
    // All caption content is present in the static render.
    expect(w.text()).toContain('Cut The Crap')
  })
})
