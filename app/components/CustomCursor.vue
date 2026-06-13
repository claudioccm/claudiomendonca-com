<script setup lang="ts">
// CustomCursor — global custom cursor for the dark redesign (PRO-110).
//
// Capability-gated and SSR-safe (mirrors GrainOverlay's global-overlay pattern):
//   - Renders NOTHING and touches NOTHING on the server / during prerender.
//   - Activates in onMounted ONLY when `(pointer: fine)` matches AND
//     prefers-reduced-motion is NOT set. On touch or reduced-motion it stays
//     inert: no element shown, native cursor untouched, zero layout shift.
//   - When active: a fixed, pointer-events:none dot follows the pointer (GSAP
//     quickTo for a smooth trailing follow) and grows/changes via .is-hovering
//     when the pointer is over an a / button / [data-cursor] element.
//   - Stays reactive: if the pointer type or motion preference changes at
//     runtime it activates/deactivates accordingly. Everything is torn down on
//     unmount.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

const reduced = useReducedMotion()

const isActive = ref(false)
const isHovering = ref(false)
const dotRef = ref<HTMLElement | null>(null)

// Quick-setters created from GSAP quickTo when active; null otherwise.
let quickX: ((value: number) => void) | null = null
let quickY: ((value: number) => void) | null = null

let fineMql: MediaQueryList | null = null

function onPointerMove(event: PointerEvent) {
  if (quickX && quickY) {
    quickX(event.clientX)
    quickY(event.clientY)
  } else if (dotRef.value) {
    // Fallback (no GSAP yet): position directly. The element is centered on the
    // pointer via its own -50%/-50% margin offset (see scoped CSS), so we only
    // need to place its top-left at the pointer here.
    dotRef.value.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`
  }
}

function onPointerOver(event: PointerEvent) {
  const target = event.target as Element | null
  isHovering.value = !!target?.closest('a, button, [data-cursor]')
}

async function activate() {
  if (isActive.value) return
  isActive.value = true
  document.body.classList.add('cursor-active')

  // Smooth trailing follow via GSAP quickTo (client-only dynamic import, same
  // SSR-safety pattern as useScrollReveal). Falls back to direct positioning if
  // GSAP or the element isn't ready.
  try {
    const { gsap } = await import('gsap')
    if (dotRef.value) {
      // Center the dot on the pointer via percentage transforms GSAP tracks,
      // so quickTo's x/y (pixel translate) compose cleanly with the centering.
      gsap.set(dotRef.value, { xPercent: -50, yPercent: -50 })
      quickX = gsap.quickTo(dotRef.value, 'x', { duration: 0.18, ease: 'power3' })
      quickY = gsap.quickTo(dotRef.value, 'y', { duration: 0.18, ease: 'power3' })
    }
  } catch {
    // GSAP unavailable — onPointerMove falls back to direct transform.
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerover', onPointerOver, { passive: true })
}

function deactivate() {
  if (!isActive.value) return
  isActive.value = false
  isHovering.value = false
  document.body.classList.remove('cursor-active')
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerover', onPointerOver)
  quickX = null
  quickY = null
}

function evaluate() {
  const fine = fineMql?.matches ?? false
  if (fine && !reduced.value) {
    void activate()
  } else {
    deactivate()
  }
}

onMounted(() => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  fineMql = window.matchMedia('(pointer: fine)')
  fineMql.addEventListener('change', evaluate)
  // `reduced` is a reactive Ref kept in sync by useReducedMotion's own listener;
  // re-evaluate when the pointer type changes. Reduced-motion changes are picked
  // up via the watcher below.
  evaluate()
})

// React to reduced-motion changes at runtime.
watch(reduced, () => evaluate())

onBeforeUnmount(() => {
  fineMql?.removeEventListener('change', evaluate)
  fineMql = null
  deactivate()
})
</script>

<template>
  <!-- Rendered only when active; nothing in the DOM (and native cursor intact)
       on touch / reduced-motion, so there is no layout shift either way. -->
  <div
    v-if="isActive"
    ref="dotRef"
    class="custom-cursor"
    :class="{ 'is-hovering': isHovering }"
    aria-hidden="true"
  />
</template>

<style scoped>
.custom-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 90; /* above grain (3) and overlay (60); never interactive */
  width: 14px;
  height: 14px;
  /* Negative half-size margins center the dot on the pointer in the fallback
     (non-GSAP) path, where the transform only carries the pointer position. In
     the GSAP path quickTo composes with the xPercent/yPercent -50 set on
     activate, so the dot is centered either way. */
  margin-top: -7px;
  margin-left: -7px;
  border-radius: 9999px;
  background: var(--paper);
  mix-blend-mode: difference;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
  transition: width 180ms ease, height 180ms ease, background-color 180ms ease, margin 180ms ease;
  will-change: transform;
}
.custom-cursor.is-hovering {
  width: 44px;
  height: 44px;
  margin-top: -22px;
  margin-left: -22px;
  background: var(--accent);
}
</style>
