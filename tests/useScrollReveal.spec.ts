import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'

/**
 * useScrollReveal · progressive-enhancement reveal (PRO-109, R9 + KTD3).
 *
 * GSAP is mocked so we can assert WHICH calls the composable makes without
 * pulling the real library into the test (and to mirror its client-only
 * dynamic-import boundary). We verify:
 *   - reduced-motion: no hidden state, no ScrollTrigger
 *   - normal: hidden start state set + a tween with a scrollTrigger created
 *   - scope dispose kills the created ScrollTrigger (no leak)
 *
 * SSR no-op is covered structurally: the composable only acts inside onMounted,
 * which never fires on the server — asserted indirectly by the reduced-motion
 * case (onMounted runs, but no DOM mutation happens).
 */

const setMock = vi.fn()
const killTween = vi.fn()
const killTrigger = vi.fn()
const toMock = vi.fn(() => ({
  kill: killTween,
  scrollTrigger: { kill: killTrigger },
}))
const registerPlugin = vi.fn()

vi.mock('gsap', () => ({
  gsap: {
    set: setMock,
    to: toMock,
    registerPlugin,
  },
}))
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}))

function setReducedMotion(matches: boolean) {
  const mql = { matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  ;(window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia =
    vi.fn(() => mql as unknown as MediaQueryList)
}

// Import AFTER mocks are registered.
let useScrollReveal: typeof import('~/composables/useScrollReveal')['useScrollReveal']

beforeEach(async () => {
  vi.clearAllMocks()
  ;({ useScrollReveal } = await import('~/composables/useScrollReveal'))
})

afterEach(() => {
  vi.restoreAllMocks()
})

function makeHarness() {
  return defineComponent({
    setup() {
      const el = ref<HTMLElement | null>(null)
      useScrollReveal(el)
      return () => h('div', { ref: el }, 'revealed content')
    },
  })
}

describe('useScrollReveal', () => {
  it('does nothing under reduced-motion (no hidden state, no ScrollTrigger)', async () => {
    setReducedMotion(true)
    const wrapper = mount(makeHarness())
    await flushPromises()
    expect(setMock).not.toHaveBeenCalled()
    expect(toMock).not.toHaveBeenCalled()
    // Content remains present/visible.
    expect(wrapper.text()).toContain('revealed content')
    wrapper.unmount()
  })

  it('applies a hidden start state and creates a reveal tween when motion is allowed', async () => {
    setReducedMotion(false)
    const wrapper = mount(makeHarness())
    await flushPromises()
    expect(setMock).toHaveBeenCalledTimes(1)
    expect(toMock).toHaveBeenCalledTimes(1)
    // The tween config wires a ScrollTrigger on the element.
    const tweenConfig = toMock.mock.calls[0]![1] as { scrollTrigger?: unknown }
    expect(tweenConfig.scrollTrigger).toBeTruthy()
    wrapper.unmount()
  })

  it('kills the created ScrollTrigger on unmount (no leak)', async () => {
    setReducedMotion(false)
    const wrapper = mount(makeHarness())
    await flushPromises()
    wrapper.unmount()
    expect(killTrigger).toHaveBeenCalledTimes(1)
    expect(killTween).toHaveBeenCalledTimes(1)
  })
})
