import { ref, type Ref } from 'vue'
import { useReducedMotion } from './useReducedMotion'

/**
 * useWebGLCapable — decides whether WebGL-heavy effects should run (PRO-109, R8).
 *
 * Returns a ref that is `false` when ANY of these hold:
 *   - SSR / no window (never run WebGL on the server)
 *   - prefers-reduced-motion (reuses useReducedMotion)
 *   - small viewport (width < SMALL_VIEWPORT_PX)
 *   - low CPU parallelism (navigator.hardwareConcurrency < MIN_CORES)
 *   - low memory (navigator.deviceMemory present AND < MIN_MEMORY_GB)
 *
 * NOTE: this composable does NOT import `three` — it only *decides* whether a
 * later-cycle component should mount a Three.js scene, keeping the heavy lib out
 * of the SSR graph (KTD2). `deviceMemory` is non-standard / not on every browser;
 * its absence does not by itself force `false`.
 */
const SMALL_VIEWPORT_PX = 768
const MIN_CORES = 4
const MIN_MEMORY_GB = 4

interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number
}

export function useWebGLCapable(): Ref<boolean> {
  // SSR / no window: never capable on the server.
  if (typeof window === 'undefined') {
    return ref(false)
  }

  const reduced = useReducedMotion()
  if (reduced.value) return ref(false)

  if (window.innerWidth < SMALL_VIEWPORT_PX) return ref(false)

  const nav = navigator as NavigatorWithDeviceMemory

  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency < MIN_CORES) {
    return ref(false)
  }

  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < MIN_MEMORY_GB) {
    return ref(false)
  }

  return ref(true)
}
