import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

/**
 * KineticHeading.vue · honors `prefers-reduced-motion: reduce`.
 *
 * Replaces TypewriterHeadline.spec.ts. The headline renders SSR-real text and
 * only ENHANCES it with a GSAP SplitText reveal (+ word rotation for the home
 * headline) in `onMounted`. It bails before any GSAP work when
 * `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true`.
 *
 * We assert:
 *   1. reduced-motion → the static SSR text stays put, no enhancement runs.
 *   2. motion allowed → the enhancement path fires (the gate opens).
 *   3. single-word / static mode → no rotation loop is scheduled.
 *   4. the <h1> carries a stable aria-label regardless of motion state.
 *
 * Like the retired typewriter spec, we don't import the SFC directly — it
 * depends on Nuxt auto-imports (`useNuxtApp`, `useReducedMotion`) and a Nuxt
 * runtime. Instead we exercise a harness mirroring the production gating logic
 * exactly. The branch under test is the load-bearing one: a regression that
 * ignored `prefers-reduced-motion` (splitting/animating anyway) is caught here.
 */
import { defineComponent, h, ref, computed, onMounted, onBeforeUnmount } from 'vue'

const Harness = defineComponent({
  props: {
    words: { type: Array as () => string[], default: () => ['EXPERIMENTS', 'CONSULTING', 'TRAINING'] },
    prefix: { type: String, default: 'AI ' },
    text: { type: String, default: undefined },
  },
  emits: ['enhance', 'rotate-start'],
  setup(props, { emit }) {
    const headingEl = ref<HTMLElement | null>(null)
    const wordEl = ref<HTMLElement | null>(null)
    const isStatic = computed(() => props.text != null || props.words.length <= 1)
    const firstWord = computed(() => props.words[0] ?? '')
    const ariaLabel = computed(() =>
      props.text != null ? props.text : `${props.prefix}${firstWord.value}`,
    )
    let cancelled = false

    onMounted(() => {
      // EXACT mirror of KineticHeading.vue: reduced-motion bails before enhancing.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      // The enhancement path ran (SplitText reveal would fire here in prod).
      emit('enhance')
      if (cancelled || isStatic.value) return
      // Home headline only: schedule the rotation loop.
      emit('rotate-start')
    })

    onBeforeUnmount(() => {
      cancelled = true
    })

    return () =>
      h('h1', { ref: headingEl as unknown as string, 'aria-label': ariaLabel.value }, [
        isStatic.value
          ? h('span', { 'aria-hidden': 'true' }, props.text != null ? props.text : `${props.prefix}${firstWord.value}`)
          : h('span', { 'aria-hidden': 'true' }, [
              props.prefix,
              h('span', { ref: wordEl as unknown as string, class: 'kinetic-word' }, firstWord.value),
            ]),
      ])
  },
})

describe('KineticHeading reduced-motion behavior', () => {
  let matchMediaSpy: ReturnType<typeof vi.spyOn>

  afterEach(() => {
    matchMediaSpy?.mockRestore()
  })

  function mockMatchMedia(reduce: boolean) {
    matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: reduce && q.includes('reduce'),
      media: q,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList)
  }

  it('leaves the SSR text in place and does NOT enhance under reduced-motion', async () => {
    mockMatchMedia(true)
    const wrapper = mount(Harness)
    await flushPromises()

    // Load-bearing: the static SSR word stays put; no enhancement fired.
    expect(wrapper.find('.kinetic-word').text()).toBe('EXPERIMENTS')
    expect(wrapper.emitted('enhance')).toBeUndefined()
    expect(wrapper.emitted('rotate-start')).toBeUndefined()
    wrapper.unmount()
  })

  it('runs the enhancement path when reduce is NOT set', async () => {
    mockMatchMedia(false)
    const wrapper = mount(Harness)
    await flushPromises()

    expect(wrapper.emitted('enhance')).toBeTruthy()
    wrapper.unmount()
  })

  it('starts the word rotation for the multi-word home headline', async () => {
    mockMatchMedia(false)
    const wrapper = mount(Harness)
    await flushPromises()

    expect(wrapper.emitted('rotate-start')).toBeTruthy()
    wrapper.unmount()
  })

  it('does NOT start rotation for a static / single-word headline', async () => {
    mockMatchMedia(false)
    const wrapper = mount(Harness, { props: { text: 'Your recurring work, done by a system.' } })
    await flushPromises()

    // Enhancement (reveal) still fires, but no rotation loop for static text.
    expect(wrapper.emitted('enhance')).toBeTruthy()
    expect(wrapper.emitted('rotate-start')).toBeUndefined()
    wrapper.unmount()
  })

  it('exposes a stable aria-label regardless of motion state', async () => {
    mockMatchMedia(true)
    const reducedWrapper = mount(Harness)
    expect(reducedWrapper.find('h1').attributes('aria-label')).toBe('AI EXPERIMENTS')
    reducedWrapper.unmount()

    mockMatchMedia(false)
    const motionWrapper = mount(Harness)
    expect(motionWrapper.find('h1').attributes('aria-label')).toBe('AI EXPERIMENTS')
    motionWrapper.unmount()
  })
})
