import { describe, it, expect, vi, afterEach } from 'vitest'
import { effectScope } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

/**
 * useReducedMotion · reactive prefers-reduced-motion (PRO-109, R7).
 *
 * We stub `window.matchMedia` with a controllable MediaQueryList so we can
 * assert the initial value, reactive `change` updates, and listener cleanup on
 * scope dispose.
 */

interface FakeMql {
  matches: boolean
  addEventListener: ReturnType<typeof vi.fn>
  removeEventListener: ReturnType<typeof vi.fn>
  _fire: (matches: boolean) => void
}

function stubMatchMedia(initialMatches: boolean): FakeMql {
  let handler: ((e: MediaQueryListEvent) => void) | undefined
  const mql: FakeMql = {
    matches: initialMatches,
    addEventListener: vi.fn((_type: string, cb: (e: MediaQueryListEvent) => void) => {
      handler = cb
    }),
    removeEventListener: vi.fn(),
    _fire: (matches: boolean) => {
      mql.matches = matches
      handler?.({ matches } as MediaQueryListEvent)
    },
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mql as unknown as MediaQueryList))
  // happy-dom: also expose on window for code that reads window.matchMedia.
  ;(window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia =
    vi.fn(() => mql as unknown as MediaQueryList)
  return mql
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useReducedMotion', () => {
  it('reflects matches:false at mount', () => {
    stubMatchMedia(false)
    const scope = effectScope()
    const result = scope.run(() => useReducedMotion())!
    expect(result.value).toBe(false)
    scope.stop()
  })

  it('reflects matches:true at mount', () => {
    stubMatchMedia(true)
    const scope = effectScope()
    const result = scope.run(() => useReducedMotion())!
    expect(result.value).toBe(true)
    scope.stop()
  })

  it('updates reactively when the media query changes', () => {
    const mql = stubMatchMedia(false)
    const scope = effectScope()
    const result = scope.run(() => useReducedMotion())!
    expect(result.value).toBe(false)
    mql._fire(true)
    expect(result.value).toBe(true)
    scope.stop()
  })

  it('removes its listener on scope dispose', () => {
    const mql = stubMatchMedia(false)
    const scope = effectScope()
    scope.run(() => useReducedMotion())
    expect(mql.addEventListener).toHaveBeenCalledTimes(1)
    scope.stop()
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1)
  })
})
