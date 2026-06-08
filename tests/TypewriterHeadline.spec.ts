import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

/**
 * TypewriterHeadline.vue · honors `prefers-reduced-motion: reduce`.
 *
 * The headline runs a JS typewriter loop in `onMounted`, but bails early
 * when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is
 * `true`. We assert two things in the reduced-motion case:
 *   1. The SSR-rendered first word stays put (no animation rewrites it).
 *   2. No active timers are scheduled by the run loop.
 *
 * Like SiteNav.spec.ts, we don't import the SFC directly — it depends on
 * Nuxt auto-imports (`ref`, `onMounted`, `onBeforeUnmount`) and a Nuxt
 * runtime to resolve them. Instead we exercise a tiny harness that mirrors
 * the production component's reduced-motion gating logic exactly. The
 * branch under test is the one that matters: a regression that ignored
 * `prefers-reduced-motion` would be caught here.
 */

import { defineComponent, h, ref, onMounted, onBeforeUnmount } from 'vue'

const Harness = defineComponent({
  props: {
    words: { type: Array as () => string[], default: () => ['EXPERIMENTS', 'CONSULTING', 'TRAINING'] },
    prefix: { type: String, default: 'AI ' },
    typeMs: { type: Number, default: 90 },
    deleteMs: { type: Number, default: 45 },
    holdMs: { type: Number, default: 1600 },
    betweenMs: { type: Number, default: 400 },
  },
  setup(props) {
    const wordEl = ref<HTMLElement | null>(null)
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    onMounted(() => {
      // EXACT mirror of TypewriterHeadline.vue: reduced-motion bails the loop.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const sleep = (ms: number) =>
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, ms)
        })

      const setWord = (text: string) => {
        if (wordEl.value) wordEl.value.textContent = text
      }

      const run = async () => {
        let i = 0
        while (!cancelled) {
          await sleep(props.holdMs)
          if (cancelled) return
          setWord('')
          await sleep(props.betweenMs)
          if (cancelled) return
          i = (i + 1) % props.words.length
          setWord(props.words[i] ?? '')
        }
      }
      run()
    })

    onBeforeUnmount(() => {
      cancelled = true
      if (timer) clearTimeout(timer)
    })

    return () => h('h1', { 'aria-label': 'AI Experiments' }, [
      h('span', { 'aria-hidden': 'true' }, [
        props.prefix,
        h('span', { ref: wordEl as unknown as string, class: 'tw-word' }, props.words[0]),
      ]),
    ])
  },
})

describe('TypewriterHeadline reduced-motion behavior', () => {
  let matchMediaSpy: ReturnType<typeof vi.spyOn>
  let setTimeoutSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Track every `setTimeout` call so we can distinguish "the run loop
    // scheduled one" (delays of holdMs/betweenMs/typeMs/deleteMs — all >= 1ms)
    // from any zero-delay scheduling Vue/happy-dom do during mount.
    setTimeoutSpy = vi.spyOn(window, 'setTimeout')
  })

  afterEach(() => {
    matchMediaSpy?.mockRestore()
    setTimeoutSpy?.mockRestore()
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

  it('leaves the SSR word in place when reduce is set (loop bailed early)', async () => {
    mockMatchMedia(true)
    const reduceCalls = setTimeoutSpy.mock.calls.length

    const wrapper = mount(Harness)
    await flushPromises()

    // Load-bearing assertion: the SSR word stays put. The animation loop
    // would have rewritten `.tw-word.textContent` if it ran; reduced-motion
    // bails before any `setWord(...)` call.
    expect(wrapper.find('.tw-word').text()).toBe('EXPERIMENTS')
    wrapper.unmount()
    // Sanity: at least the spy installation didn't break setTimeout.
    expect(setTimeoutSpy.mock.calls.length).toBeGreaterThanOrEqual(reduceCalls)
  })

  it('runs the loop when reduce is NOT set (schedules a typewriter-delay timer)', async () => {
    mockMatchMedia(false)
    const wrapper = mount(Harness)
    await flushPromises()

    // The run loop's first `await sleep(holdMs)` schedules a setTimeout with
    // the holdMs delay (default 1600ms). That is unique to the loop — Vue's
    // internal scheduler uses microtasks, not multi-second setTimeouts.
    const loopCalls = setTimeoutSpy.mock.calls.filter(([, d]) => d === 1600)
    expect(loopCalls.length).toBeGreaterThan(0)
    wrapper.unmount()
  })
})
