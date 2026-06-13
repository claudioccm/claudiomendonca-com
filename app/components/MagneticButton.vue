<!--
  MagneticButton — pill CTA for the redesigned hero (PRO-111, U1).

  Replaces the old .btn / .btn-filled / .btn-ghost links in the hero. Polymorphic:
  renders <NuxtLink> when `to` is set (internal route), <a> when `href` is set
  (external / anchor / mailto), else <button>. So it's a drop-in for every hero
  CTA shape (#work anchor, /consulting route, mailto:, #how anchor).

  Two layers of motion, BOTH capability-gated (mirrors CustomCursor, PRO-110):
    - hover-fill: an accent sweep on hover/focus (pure CSS, always on — it's a
      state change, not motion, and is harmless under reduced-motion).
    - magnetic: the pill translates a capped fraction toward the pointer on
      pointermove, easing back on leave. Runs ONLY on `(pointer: fine)` AND when
      prefers-reduced-motion is NOT set. On touch / reduced-motion it's a normal
      static pill.

  SSR-safe: the element + its label render on the server (real CTA copy in
  view-source). Motion wiring lives in onMounted, torn down on unmount.
  Accessible: real <a>/<button> semantics, visible :focus-visible ring, ≥44px
  hit area enforced in CSS.
-->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

interface Props {
  /** Visual variant. 'filled' = accent fill; 'ghost' = transparent + hairline. */
  variant?: 'filled' | 'ghost'
  /** External / anchor / mailto target → renders an <a>. */
  href?: string
  /** Internal route → renders a <NuxtLink>. Takes precedence over href. */
  to?: string
  /** Show the trailing arrow glyph (mirrors the old .btn-arrow). */
  arrow?: boolean
  /** How far (px) the pill may translate toward the pointer. */
  strength?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'filled',
  href: undefined,
  to: undefined,
  arrow: false,
  strength: 6,
})

const reduced = useReducedMotion()

// Polymorphic element: NuxtLink (route) > a (href) > button.
const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'button'))

// `:is` may resolve to NuxtLink (a component), in which case the template ref
// is the component's public instance, not the <a> DOM node. Normalize to the
// real HTMLElement (a component instance exposes its root via `$el`) so
// addEventListener / style writes never land on a non-Element.
const rootRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null)
function rootEl(): HTMLElement | null {
  const r = rootRef.value
  if (!r) return null
  const el = (r as { $el?: HTMLElement }).$el ?? (r as HTMLElement)
  return el instanceof HTMLElement ? el : null
}

let active = false
let fineMql: MediaQueryList | null = null

function onPointerMove(event: PointerEvent) {
  const el = rootEl()
  if (!el) return
  const rect = el.getBoundingClientRect()
  const dx = event.clientX - (rect.left + rect.width / 2)
  const dy = event.clientY - (rect.top + rect.height / 2)
  // Pull a capped fraction toward the pointer (offset normalized by half-size).
  const x = (dx / (rect.width / 2)) * props.strength
  const y = (dy / (rect.height / 2)) * props.strength
  el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`
}

function onPointerLeave() {
  const el = rootEl()
  if (el) el.style.transform = ''
}

function activate() {
  const el = rootEl()
  if (active || !el) return
  active = true
  el.addEventListener('pointermove', onPointerMove)
  el.addEventListener('pointerleave', onPointerLeave)
}

function deactivate() {
  if (!active) return
  active = false
  const el = rootEl()
  el?.removeEventListener('pointermove', onPointerMove)
  el?.removeEventListener('pointerleave', onPointerLeave)
  if (el) el.style.transform = ''
}

function evaluate() {
  const fine = fineMql?.matches ?? false
  if (fine && !reduced.value) activate()
  else deactivate()
}

onMounted(() => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  fineMql = window.matchMedia('(pointer: fine)')
  fineMql.addEventListener('change', evaluate)
  evaluate()
})

watch(reduced, () => evaluate())

onBeforeUnmount(() => {
  fineMql?.removeEventListener('change', evaluate)
  fineMql = null
  deactivate()
})
</script>

<template>
  <component
    :is="tag"
    ref="rootRef"
    class="magnetic-btn"
    :class="`magnetic-btn--${variant}`"
    :href="href"
    :to="to"
  >
    <span class="magnetic-btn__label"><slot /></span>
    <span v-if="arrow" class="magnetic-btn__arrow" aria-hidden="true">→</span>
  </component>
</template>

<style scoped>
.magnetic-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  /* ≥44px hit area (matches the old .btn padding 16px 28.8px → ~52px tall). */
  min-height: 44px;
  min-width: 44px;
  padding: 16px 28.8px;
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  font-size: var(--text-body);
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  border-radius: var(--radius-buttons);
  border: 1px solid var(--paper);
  cursor: pointer;
  overflow: hidden;
  /* transform: magnetic translate (set inline in JS). The transition smooths the
     ease-back on pointerleave; harmless under reduced-motion since no transform
     is ever written there. */
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), color 220ms ease;
  isolation: isolate;
}

/* Hover-fill sweep: an accent layer behind the label that scales in from the
   bottom on hover/focus. Pure state change — left on under reduced-motion. */
.magnetic-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--accent);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.magnetic-btn:hover::before,
.magnetic-btn:focus-visible::before {
  transform: scaleY(1);
}

.magnetic-btn__label,
.magnetic-btn__arrow {
  position: relative;
  z-index: 1;
}
.magnetic-btn__arrow {
  display: inline-block;
  transition: transform 200ms ease;
}
.magnetic-btn:hover .magnetic-btn__arrow {
  transform: translateX(4px);
}

/* Filled: paper fill, ink text; on hover the accent sweep takes over with ink
   text staying legible. */
.magnetic-btn--filled {
  background: var(--paper);
  color: var(--ink);
  border-color: var(--paper);
}
.magnetic-btn--filled:hover,
.magnetic-btn--filled:focus-visible {
  color: var(--ink);
}

/* Ghost: transparent with a light hairline; the accent sweep fills on hover and
   the text flips to ink for contrast against the accent. */
.magnetic-btn--ghost {
  background: transparent;
  color: var(--paper);
  border-color: var(--paper);
}
.magnetic-btn--ghost:hover,
.magnetic-btn--ghost:focus-visible {
  color: var(--ink);
}

.magnetic-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.magnetic-btn:active {
  transform: translateY(1px);
}

@media (prefers-reduced-motion: reduce) {
  .magnetic-btn,
  .magnetic-btn::before,
  .magnetic-btn__arrow {
    transition: none;
  }
}
</style>
