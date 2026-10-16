<!--
  Home hero background: an ASCII water surface (Claudio 2026-10-16, replacing
  the dot ripple). Simulation + defaults: app/lib/asciiWater.ts.

  - Pointer move over the hero drags a "stick" through the water (low wake);
    a finger drag does the same through passive touch listeners, so scrolling
    is never blocked.
  - Click / tap drops a "rock" (high, multi-ring burst) at that point.
  - The parent calls `textRipple()` when the typewriter swaps its word (medium).

  Listens on the parent element (the hero section); the canvas itself is
  pointer-events: none and aria-hidden, so links and focus are untouched.
  Reduced motion: one static frame, no loop, no listeners. One rAF loop that
  sleeps when the water is flat, the hero is off screen or the tab is hidden.

  Tuning panel (DialKit): `?dials` on dev and deploy previews only. The import
  sits behind the build-time __HERO_DIALS__ flag (nuxt.config.ts), so Netlify
  production builds drop it entirely.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  HERO_WATER_DEFAULTS,
  WaterSurface,
  calmMask,
  cloneConfig,
  levelFor,
  makeEmitter,
  tickEmitter,
  waveCoefficients,
} from '~/lib/asciiWater'
import type { Box, Emitter, HeroWaterConfig } from '~/lib/asciiWater'

const props = defineProps<{
  /** Content elements; the water calms down behind one box around all of them. */
  calmTargets?: () => Element[]
}>()

const canvasEl = ref<HTMLCanvasElement | null>(null)

const cfg: HeroWaterConfig = cloneConfig(HERO_WATER_DEFAULTS)
const TICK_MS = 1000 / 60
const LINE_HEIGHT = 1.2

let ctx: CanvasRenderingContext2D | null = null
let surface: WaterSurface | null = null
let atlas: HTMLCanvasElement | null = null
let levels = new Uint8Array(0)
let calm: Float32Array = new Float32Array(0)
let rampLen = 1
let dpr = 1
// Cell size in device px (integers, so atlas blits stay crisp) and CSS px.
let cwD = 8
let chD = 16
let cellW = 8
let cellH = 16
// Simulation cells: square-ish, one glyph wide, `perGlyph` of them per glyph row.
let sx = 8
let sy = 8
let perGlyph = 2
let glyphCols = 0
let glyphRows = 0
let coef = { k: 0.5, substeps: 1 }
let emitters: Emitter[] = []
let rgb = '230, 246, 244'
let fontFamily = 'monospace'

let raf: number | null = null
let lastFrame = 0
let acc = 0
let onScreen = true
let reduced = false
let fullRedraw = true
let quietTicks = 0
const cleanups: Array<() => void> = []

// Stick wake: last pointer position and the distance travelled since the last emission.
let lastX: number | null = null
let lastY = 0
let travelled = 0

// Perf readout for tuning (frame cost in ms, averaged).
const stats = { frameMs: 0, cells: 0 }

function readTheme() {
  const root = getComputedStyle(document.documentElement)
  rgb = root.getPropertyValue('--paper-rgb').trim() || rgb
  if (canvasEl.value) fontFamily = getComputedStyle(canvasEl.value).fontFamily || fontFamily
}

/** Pre-render each ramp glyph at its opacity once, then the loop only blits. */
function buildAtlas() {
  const ramp = Array.from(cfg.render.ramp || ' .')
  rampLen = Math.max(2, ramp.length)
  const fontPx = cfg.render.cellSize * dpr
  const a = atlas ?? document.createElement('canvas')
  a.width = cwD * rampLen
  a.height = chD
  const g = a.getContext('2d')!
  g.clearRect(0, 0, a.width, a.height)
  g.font = `${fontPx}px ${fontFamily}`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  const { opacityMin, opacityMax } = cfg.render
  for (let i = 0; i < rampLen; i++) {
    const ch = ramp[i] ?? ' '
    if (ch === ' ') continue
    const alpha = opacityMin + (opacityMax - opacityMin) * (i / (rampLen - 1))
    g.fillStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`
    g.fillText(ch, i * cwD + cwD / 2, chD / 2)
  }
  atlas = a
  fullRedraw = true
}

/** Size the canvas to its box and rebuild the grid (resets the water). */
function layout() {
  const canvas = canvasEl.value
  if (!canvas || !ctx) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = Math.max(1, Math.round(w * dpr))
  canvas.height = Math.max(1, Math.round(h * dpr))
  ctx.font = `${cfg.render.cellSize * dpr}px ${fontFamily}`
  const pitch = Math.max(1, cfg.render.spacing)
  cwD = Math.max(2, Math.round(ctx.measureText('M').width * pitch))
  chD = Math.max(4, Math.round(cfg.render.cellSize * LINE_HEIGHT * dpr * pitch))
  cellW = cwD / dpr
  cellH = chD / dpr
  glyphCols = Math.ceil(canvas.width / cwD)
  glyphRows = Math.ceil(canvas.height / chD)
  perGlyph = Math.max(1, Math.round(cellH / cellW))
  sx = cellW
  sy = cellH / perGlyph
  if (surface) surface.resize(glyphCols, glyphRows * perGlyph)
  else surface = new WaterSurface(glyphCols, glyphRows * perGlyph)
  levels = new Uint8Array(glyphCols * glyphRows).fill(255)
  coef = waveCoefficients(cfg.water.speed, Math.sqrt(sx * sy))
  emitters = []
  buildAtlas()
  updateCalm()
  // Paint the resting field now, so it shows before (or without) the first animation frame.
  draw()
}

/** Measure the hero content (its text, not full-width boxes), take one box around it all, and rebuild the calm mask. */
function updateCalm() {
  const canvas = canvasEl.value
  if (!canvas) return
  const r = canvas.getBoundingClientRect()
  let box: Box | null = null
  const range = document.createRange()
  for (const el of props.calmTargets?.() ?? []) {
    range.selectNodeContents(el)
    const b = range.getBoundingClientRect()
    if (!b.width || !b.height) continue
    const l = b.left - r.left
    const t = b.top - r.top
    const rt = b.right - r.left
    const bt = b.bottom - r.top
    box = box ? [Math.min(box[0], l), Math.min(box[1], t), Math.max(box[2], rt), Math.max(box[3], bt)] : [l, t, rt, bt]
  }
  const boxes: Box[] = box ? [box] : []
  const { padding, feather } = cfg.calm
  calm = calmMask(glyphCols, glyphRows, cellW, cellH, boxes, padding, feather)
  fullRedraw = true
}

function simTick() {
  if (!surface) return
  for (let i = emitters.length - 1; i >= 0; i--) {
    if (!tickEmitter(emitters[i]!, surface, sx, sy)) emitters.splice(i, 1)
  }
  const amb = cfg.water.ambient
  if (amb > 0 && Math.random() < amb * 0.06) {
    const x = Math.random() * surface.cols
    const y = Math.random() * surface.rows
    surface.disturb(x, y, 10 / sx, 10 / sy, -amb * 0.6, 1)
  }
  const damp = cfg.water.damping / coef.substeps
  for (let s = 0; s < coef.substeps; s++) surface.step(coef.k, damp)
}

function draw() {
  if (!ctx || !surface || !atlas) return
  const { cols, cur } = surface
  const { base, contrast, gamma } = cfg.render
  const strength = cfg.calm.strength
  const full = fullRedraw
  const inv = 1 / perGlyph
  if (full) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  let drawn = 0
  for (let y = 0; y < glyphRows; y++) {
    const dy = y * chD
    const simRow = y * perGlyph * cols
    const row = y * glyphCols
    for (let x = 0; x < glyphCols; x++) {
      const i = row + x
      // A glyph shows the mean height of the simulation cells under it.
      let h = 0
      for (let r = 0, j = simRow + x; r < perGlyph; r++, j += cols) h += cur[j]!
      const m = calm[i]! * strength
      const lv = levelFor(h * inv * (1 - m), rampLen, base, contrast, gamma)
      if (!full && lv === levels[i]) continue
      levels[i] = lv
      const dx = x * cwD
      if (!full) ctx.clearRect(dx, dy, cwD, chD)
      if (lv > 0) {
        // Calm zone: flatter (above) and fainter glyphs behind the copy.
        if (m > 0) ctx.globalAlpha = 1 - 0.65 * m
        ctx.drawImage(atlas, lv * cwD, 0, cwD, chD, dx, dy, cwD, chD)
        if (m > 0) ctx.globalAlpha = 1
        drawn++
      }
    }
  }
  fullRedraw = false
  stats.cells = drawn
}

function frame(now: number) {
  raf = null
  const budget = 1000 / Math.max(1, cfg.render.fps)
  const dt = now - lastFrame
  if (dt < budget - 1) {
    schedule()
    return
  }
  const t0 = performance.now()
  // Fixed 60 Hz simulation regardless of the frame cap; cap catch-up after a stall.
  acc = Math.min(acc + dt, TICK_MS * 4)
  lastFrame = now
  while (acc >= TICK_MS) {
    simTick()
    acc -= TICK_MS
  }
  draw()
  stats.frameMs = stats.frameMs * 0.9 + (performance.now() - t0) * 0.1

  // Sleep once the water is flat and nothing is feeding it.
  const flat = !emitters.length && cfg.water.ambient <= 0 && (surface?.peak() ?? 0) < 0.004
  quietTicks = flat ? quietTicks + 1 : 0
  if (quietTicks > 30) {
    surface?.clear()
    fullRedraw = true
    draw()
    return
  }
  schedule()
}

function schedule() {
  if (raf !== null || reduced || !onScreen || document.hidden) return
  raf = requestAnimationFrame(frame)
}

function wake() {
  if (raf !== null) return
  quietTicks = 0
  lastFrame = performance.now() - TICK_MS
  acc = 0
  schedule()
}

/* ---------- sources ---------- */
function localPoint(clientX: number, clientY: number) {
  const r = canvasEl.value!.getBoundingClientRect()
  return { x: clientX - r.left, y: clientY - r.top, inside: clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom }
}

function stickTo(clientX: number, clientY: number) {
  if (!surface || cfg.hover.intensity <= 0) return
  const p = localPoint(clientX, clientY)
  if (!p.inside) {
    lastX = null
    return
  }
  if (lastX === null) {
    lastX = p.x
    lastY = p.y
    return
  }
  const dx = p.x - lastX
  const dy = p.y - lastY
  const dist = Math.hypot(dx, dy)
  const spacing = Math.max(1, cfg.hover.spacing)
  let along = spacing - travelled
  let emitted = 0
  while (along <= dist && emitted < 24) {
    const t = along / dist
    surface.disturb(
      (lastX + dx * t) / sx,
      (lastY + dy * t) / sy,
      cfg.hover.radius / sx,
      cfg.hover.radius / sy,
      -cfg.hover.intensity * 0.5,
      cfg.hover.falloff,
    )
    along += spacing
    emitted++
  }
  travelled = (travelled + dist) % spacing
  lastX = p.x
  lastY = p.y
  if (emitted) wake()
}

function rock(clientX: number, clientY: number) {
  const p = localPoint(clientX, clientY)
  if (!p.inside || cfg.click.intensity <= 0) return
  emitters.push(makeEmitter(p.x, p.y, cfg.click.radius, cfg.click.intensity, cfg.click.rings, cfg.water.speed))
  wake()
}

/** Medium ripple from the headline when the typewriter swaps its word (client-coordinate rects). */
function textRipple(word: DOMRect | null, headline: DOMRect | null) {
  updateCalm()
  if (reduced || !surface || cfg.text.intensity <= 0) return
  const box = cfg.text.origin === 'word' ? (word ?? headline) : headline
  if (!box) return
  let cx = box.left + box.width / 2
  let cy = box.top + box.height / 2
  if (cfg.text.origin === 'random') {
    cx = box.left + Math.random() * box.width
    cy = box.top + Math.random() * box.height
  }
  const r = canvasEl.value!.getBoundingClientRect()
  emitters.push(makeEmitter(cx - r.left, cy - r.top, cfg.text.radius, cfg.text.intensity, 2, cfg.water.speed))
  wake()
}

defineExpose({ textRipple })

/** Apply new dial values; only rebuild what the change needs. */
function applyConfig(next: HeroWaterConfig) {
  const prevRender = JSON.stringify(cfg.render)
  const prevSpeed = cfg.water.speed
  Object.assign(cfg.hover, next.hover)
  Object.assign(cfg.click, next.click)
  Object.assign(cfg.text, next.text)
  Object.assign(cfg.water, next.water)
  const prevCalm = `${cfg.calm.padding}/${cfg.calm.feather}`
  Object.assign(cfg.calm, next.calm)
  if (`${cfg.calm.padding}/${cfg.calm.feather}` !== prevCalm) updateCalm()
  fullRedraw = true
  const oldGrid = `${cfg.render.cellSize}/${cfg.render.spacing}`
  Object.assign(cfg.render, next.render)
  if (`${cfg.render.cellSize}/${cfg.render.spacing}` !== oldGrid) layout()
  else if (JSON.stringify(cfg.render) !== prevRender) buildAtlas()
  if (cfg.water.speed !== prevSpeed) coef = waveCoefficients(cfg.water.speed, Math.sqrt(sx * sy))
  if (reduced) staticFrame()
  else wake()
}

/** Reduced motion: one frozen frame of a rock's rings, drawn once. */
function staticFrame() {
  if (!surface) return
  surface.clear()
  emitters = [makeEmitter(surface.cols * sx * 0.72, surface.rows * sy * 0.58, cfg.click.radius, cfg.click.intensity, cfg.click.rings, cfg.water.speed)]
  for (let i = 0; i < 150; i++) simTick()
  emitters = []
  fullRedraw = true
  draw()
}

async function openDials() {
  if (!__HERO_DIALS__) return
  if (!new URLSearchParams(window.location.search).has('dials')) return
  const { mountHeroWaterDials } = await import('~/lib/heroWaterDials')
  const destroy = mountHeroWaterDials(cfg, applyConfig, stats)
  cleanups.push(destroy)
}

onMounted(() => {
  const canvas = canvasEl.value
  const host = canvas?.parentElement
  if (!canvas || !host) return
  ctx = canvas.getContext('2d')
  if (!ctx) return
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  readTheme()
  layout()

  const relayout = () => {
    layout()
    if (reduced) staticFrame()
    else wake()
  }
  const ro = new ResizeObserver(() => relayout())
  ro.observe(canvas)
  // Re-read the glyph colour when the theme flips, and the font once it loads.
  const mo = new MutationObserver(() => {
    readTheme()
    buildAtlas()
    draw()
  })
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  document.fonts?.ready.then(() => {
    readTheme()
    relayout()
  })
  cleanups.push(() => {
    ro.disconnect()
    mo.disconnect()
  })

  if (reduced) {
    staticFrame()
  }
  else {
    const io = new IntersectionObserver((entries) => {
      onScreen = entries.some(e => e.isIntersecting)
      if (onScreen) wake()
    })
    io.observe(canvas)
    const onVis = () => {
      if (!document.hidden) wake()
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') stickTo(e.clientX, e.clientY)
    }
    const onLeave = () => {
      lastX = null
    }
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) stickTo(t.clientX, t.clientY)
    }
    const onClick = (e: MouseEvent) => rock(e.clientX, e.clientY)
    document.addEventListener('visibilitychange', onVis)
    host.addEventListener('pointermove', onPointerMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('touchmove', onTouchMove, { passive: true })
    host.addEventListener('touchend', onLeave, { passive: true })
    host.addEventListener('click', onClick)
    cleanups.push(() => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('touchmove', onTouchMove)
      host.removeEventListener('touchend', onLeave)
      host.removeEventListener('click', onClick)
    })
    wake()
  }

  if (import.meta.dev || __HERO_DIALS__) {
    (window as unknown as { __heroWater?: object }).__heroWater = { cfg, stats, applyConfig, peak: () => surface?.peak() ?? 0 }
  }
  openDials()
})

onBeforeUnmount(() => {
  if (raf !== null) cancelAnimationFrame(raf)
  raf = null
  cleanups.forEach(fn => fn())
  cleanups.length = 0
})
</script>

<template>
  <canvas ref="canvasEl" class="home-hero__water" aria-hidden="true" />
</template>
