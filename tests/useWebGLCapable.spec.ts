import { describe, it, expect, vi, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { useWebGLCapable } from '~/composables/useWebGLCapable'

/**
 * useWebGLCapable · capability gate for WebGL effects (PRO-109, R8).
 *
 * We drive the four signals it reads — reduced-motion (matchMedia), viewport
 * width, hardwareConcurrency, deviceMemory — and assert the boolean result.
 */

function setReducedMotion(matches: boolean) {
  const mql = {
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  ;(window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia =
    vi.fn(() => mql as unknown as MediaQueryList)
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true })
}

function setNavigator(props: { hardwareConcurrency?: number; deviceMemory?: number }) {
  if ('hardwareConcurrency' in props) {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: props.hardwareConcurrency,
      configurable: true,
      writable: true,
    })
  }
  Object.defineProperty(navigator, 'deviceMemory', {
    value: props.deviceMemory,
    configurable: true,
    writable: true,
  })
}

/** A capable baseline: motion OK, wide viewport, plenty of cores + memory. */
function capableBaseline() {
  setReducedMotion(false)
  setViewportWidth(1440)
  setNavigator({ hardwareConcurrency: 8, deviceMemory: 8 })
}

function run(): boolean {
  const scope = effectScope()
  const result = scope.run(() => useWebGLCapable())!
  const value = result.value
  scope.stop()
  return value
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useWebGLCapable', () => {
  it('is true on a capable device', () => {
    capableBaseline()
    expect(run()).toBe(true)
  })

  it('is false when reduced-motion is preferred', () => {
    capableBaseline()
    setReducedMotion(true)
    expect(run()).toBe(false)
  })

  it('is false on a small viewport', () => {
    capableBaseline()
    setViewportWidth(480)
    expect(run()).toBe(false)
  })

  it('is false when hardwareConcurrency is below threshold', () => {
    capableBaseline()
    setNavigator({ hardwareConcurrency: 2, deviceMemory: 8 })
    expect(run()).toBe(false)
  })

  it('is false when deviceMemory is present and below threshold', () => {
    capableBaseline()
    setNavigator({ hardwareConcurrency: 8, deviceMemory: 2 })
    expect(run()).toBe(false)
  })

  it('stays true when deviceMemory is absent (undefined) but other signals are good', () => {
    capableBaseline()
    setNavigator({ hardwareConcurrency: 8, deviceMemory: undefined })
    expect(run()).toBe(true)
  })
})
