<!--
  Decorative interactive dot-field for the consulting hero — the same cursor-wave
  treatment as the home hero (Claudio feedback 2026-06-26: the consulting hero BG
  "should be similar to the homepage"). Self-contained + aria-hidden: the dots are
  built client-side in onMounted and animated only under
  `prefers-reduced-motion: no-preference`. SSR / no-JS / reduced-motion render an
  empty decorative div — no hidden content, nothing to clean up.

  The wave reacts to the global pointer position, gated to the field's own bounds,
  so it needs no reference to its parent section.

  NOTE: the physics intentionally duplicate HomeHero.vue's inline dot-field rather
  than sharing a composable — keeping the (recently fragile) home hero untouched.
  TODO: extract a shared `useDotField` composable once both heroes are stable.
  Styles: app/assets/css/sections.css (.hero-dotfield / .hero-dotfield__dot).
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const fieldEl = ref<HTMLElement | null>(null)

let waveRAF: number | null = null
let recomputeTimer: number | null = null
const cleanups: Array<() => void> = []
let dots: HTMLElement[] = []

function buildField() {
  const field = fieldEl.value
  if (!field) return
  const cols = 30
  const rows = 16
  field.style.gridTemplateColumns = `repeat(${cols},1fr)`
  field.style.gridTemplateRows = `repeat(${rows},1fr)`
  field.innerHTML = ''
  const frag = document.createDocumentFragment()
  for (let n = 0; n < cols * rows; n++) {
    const d = document.createElement('span')
    d.className = 'hero-dotfield__dot'
    frag.appendChild(d)
  }
  field.appendChild(frag)
  dots = Array.from(field.querySelectorAll<HTMLElement>('.hero-dotfield__dot'))
}

function startWave() {
  const field = fieldEl.value
  if (!field || !dots.length) return

  // Dot colour follows the --paper token (read once) so a theme recolor applies.
  const paperRgb = getComputedStyle(document.documentElement)
    .getPropertyValue('--paper-rgb').trim() || '230, 246, 244'

  let local: Array<{ el: HTMLElement, x: number, y: number }> = []
  const recompute = () => {
    local = dots.map(el => ({
      el,
      x: el.offsetLeft + el.offsetWidth / 2,
      y: el.offsetTop + el.offsetHeight / 2,
    }))
  }
  recompute()
  recomputeTimer = window.setTimeout(recompute, 400)
  window.addEventListener('resize', recompute)
  window.addEventListener('load', recompute)

  let tx = 0
  let ty = 0
  let cx = 0
  let cy = 0
  let active = false
  let env = 0
  const onMove = (e: PointerEvent) => {
    const r = field.getBoundingClientRect()
    const lx = e.clientX - r.left
    const ly = e.clientY - r.top
    const inside = lx >= 0 && ly >= 0 && lx <= r.width && ly <= r.height
    if (!inside) {
      active = false
      return
    }
    if (!active) {
      cx = lx
      cy = ly
    }
    tx = lx
    ty = ly
    active = true
  }
  window.addEventListener('pointermove', onMove)
  cleanups.push(() => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('resize', recompute)
    window.removeEventListener('load', recompute)
  })

  const loop = () => {
    const now = performance.now()
    if (active) {
      cx += (tx - cx) * 0.16
      cy += (ty - cy) * 0.16
    }
    env += ((active ? 1 : 0) - env) * 0.05
    for (const o of local) {
      let amp = 0
      if (env > 0.01) {
        const dx = o.x - cx
        const dy = o.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const fall = Math.exp(-dist / 230)
        const wave = Math.sin(dist * 0.028 - now * 0.0038)
        amp += env * fall * (wave * 0.5 + 0.5)
      }
      if (amp > 1) amp = 1
      else if (amp < 0) amp = 0
      o.el.style.transform = `scale(${1 + amp * 1.5})`
      o.el.style.background = `rgba(${paperRgb},${0.10 + amp * 0.34})`
    }
    waveRAF = requestAnimationFrame(loop)
  }
  waveRAF = requestAnimationFrame(loop)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  buildField()
  startWave()
})

onBeforeUnmount(() => {
  if (waveRAF !== null) {
    cancelAnimationFrame(waveRAF)
    waveRAF = null
  }
  if (recomputeTimer !== null) {
    clearTimeout(recomputeTimer)
    recomputeTimer = null
  }
  cleanups.forEach(fn => fn())
  cleanups.length = 0
})
</script>

<template>
  <div ref="fieldEl" class="hero-dotfield" aria-hidden="true" />
</template>
