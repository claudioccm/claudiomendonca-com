import { ref, onScopeDispose, type Ref } from 'vue'

/**
 * useReducedMotion — reactive `prefers-reduced-motion: reduce` (PRO-109, R7).
 *
 * SSR-safe: returns `false` when `window`/`matchMedia` is unavailable (server,
 * no-JS). On the client it reads the media query at call time and stays reactive
 * to OS-level changes via a `change` listener, cleaned up on scope dispose.
 *
 * Vue APIs are imported explicitly (not relying on Nuxt auto-import) so the
 * composable is unit-testable directly under Vitest.
 */
export function useReducedMotion(): Ref<boolean> {
  const reduced = ref(false)

  // SSR / environments without matchMedia: stay at the safe default (false).
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return reduced
  }

  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced.value = mql.matches

  const onChange = (event: MediaQueryListEvent) => {
    reduced.value = event.matches
  }
  mql.addEventListener('change', onChange)

  onScopeDispose(() => {
    mql.removeEventListener('change', onChange)
  })

  return reduced
}
