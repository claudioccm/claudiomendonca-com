<!--
  Home hero (editorial redesign) — the signature upper section, ported from the
  prototype (_process/design-exploration-unzipped/Hero - Combined.dc.html).

  This is a DEDICATED home component, NOT the shared HeroSection.vue (which
  /consulting still uses). It renders:
    - a full-viewport canvas-feel section with corner annotations,
    - an interactive DOT-FIELD that ripples under the cursor,
    - a TYPEWRITER that cycles the headline word ("AI Systems → Consulting →
      Training") behind a blinking caret.

  Progressive enhancement (R7): the SSR / no-JS render is the COMPLETE static
  hero — "AI <firstWord>" is in the served HTML, the dot-field container is an
  empty decorative div, every line of copy is present and visible. The dots and
  the typewriter are wired client-side in onMounted. Under
  `prefers-reduced-motion: reduce` we skip BOTH motions entirely (static word,
  no ripple) and CSS hides the caret blink. All listeners/timers/RAF are torn
  down in onBeforeUnmount (mirrors the SiteNav.vue lifecycle convention).

  The top-LEFT identity corner from the prototype is intentionally omitted: the
  persistent SiteNav wordmark already carries the name, so only the top-right
  (location / availability) + the two bottom hints render here.

  Styles live in app/assets/css/sections.css under `.home-hero`.
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Cta {
  label: string
  target: string
}

interface Props {
  /** Eyebrow, e.g. "(01) — The index". */
  eyebrow: string
  /** Upright headline stem, e.g. "AI". */
  headline: string
  /** Italic words cycled by the typewriter. words[0] is the static SSR render. */
  words: string[]
  subhead: string
  /** Two CTAs: [0] in-page anchor (#work), [1] route (/consulting). */
  ctas: Cta[]
}

const props = defineProps<Props>()

// First word is rendered server-side so "AI <word>" is in the SSR HTML.
const firstWord = props.words[0] ?? ''

const heroEl = ref<HTMLElement | null>(null)
const dotfieldEl = ref<HTMLElement | null>(null)
const wordEl = ref<HTMLElement | null>(null)

// How long each word holds before it retypes.
const HOLD_MS = 1700

// --- mutable animation state (closures, not reactive) ---
let timers: number[] = []
let waveRAF: number | null = null
const cleanups: Array<() => void> = []
let wi = 0
let dots: HTMLElement[] = []
let pulses: Array<{ x: number, y: number, t0: number }> = []
let spawnPulse: ((x: number, y: number) => void) | null = null

/* ---------- typewriter ---------- */
function typeLoop() {
  const el = wordEl.value
  if (!el) return
  const hold = window.setTimeout(() => {
    delWord(el, () => {
      wi = (wi + 1) % props.words.length
      spawnHeadlinePulse()
      typeWord(el, props.words[wi] ?? '', () => typeLoop())
    })
  }, HOLD_MS)
  timers.push(hold)
}
function typeWord(el: HTMLElement, word: string, done: () => void) {
  let i = 0
  const step = () => {
    i++
    el.textContent = word.slice(0, i)
    if (i < word.length) {
      const t = window.setTimeout(step, 70 + Math.random() * 50)
      timers.push(t)
    }
    else {
      done()
    }
  }
  step()
}
function delWord(el: HTMLElement, done: () => void) {
  const step = () => {
    const cur = el.textContent ?? ''
    if (cur.length > 0) {
      el.textContent = cur.slice(0, -1)
      const t = window.setTimeout(step, 36)
      timers.push(t)
    }
    else {
      done()
    }
  }
  step()
}

/* ---------- dot field ---------- */
function buildField() {
  const field = dotfieldEl.value
  if (!field) return
  const cols = 30
  const rows = 16
  field.style.gridTemplateColumns = `repeat(${cols},1fr)`
  field.style.gridTemplateRows = `repeat(${rows},1fr)`
  field.innerHTML = ''
  const frag = document.createDocumentFragment()
  for (let n = 0; n < cols * rows; n++) {
    const d = document.createElement('span')
    d.className = 'home-hero__dot'
    frag.appendChild(d)
  }
  field.appendChild(frag)
  dots = Array.from(field.querySelectorAll<HTMLElement>('.home-hero__dot'))
}

function spawnHeadlinePulse() {
  const field = dotfieldEl.value
  const h = heroEl.value?.querySelector('h1')
  if (!dots.length || !spawnPulse || !field || !h) return
  const fr = field.getBoundingClientRect()
  const hr = h.getBoundingClientRect()
  spawnPulse(hr.left + hr.width * 0.18 - fr.left, hr.top + hr.height / 2 - fr.top)
}

function startWave() {
  const field = dotfieldEl.value
  const sec = heroEl.value
  if (!field || !sec || !dots.length) return

  // Animated dot colour follows the --paper token (read once) so a theme
  // recolor applies to the moving dots too, not just the at-rest CSS state.
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
  const reLater = window.setTimeout(recompute, 400)
  timers.push(reLater)
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
    if (!active) {
      cx = lx
      cy = ly
    }
    tx = lx
    ty = ly
    active = true
  }
  const onLeave = () => {
    active = false
  }
  sec.addEventListener('pointermove', onMove)
  sec.addEventListener('pointerleave', onLeave)
  window.addEventListener('resize', recompute)
  cleanups.push(() => {
    sec.removeEventListener('pointermove', onMove)
    sec.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('resize', recompute)
    window.removeEventListener('load', recompute)
  })
  spawnPulse = (x: number, y: number) => {
    pulses.push({ x, y, t0: performance.now() })
  }

  const loop = () => {
    const now = performance.now()
    if (active) {
      cx += (tx - cx) * 0.16
      cy += (ty - cy) * 0.16
    }
    // Smoothly fade the cursor wave in/out as the pointer enters/leaves.
    env += ((active ? 1 : 0) - env) * 0.05
    pulses = pulses.filter(p => (now - p.t0) < 2200)
    const hasPulse = pulses.length > 0
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
      if (hasPulse) {
        for (const p of pulses) {
          const pdx = o.x - p.x
          const pdy = o.y - p.y
          const pd = Math.sqrt(pdx * pdx + pdy * pdy)
          const age = (now - p.t0) / 1000
          const ring = age * 520
          const dd = pd - ring
          const band = Math.exp(-(dd * dd) / (2 * 78 * 78))
          amp += band * Math.max(0, 1 - age / 2.1) * 0.7
        }
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

function stopAll() {
  timers.forEach(id => clearTimeout(id))
  timers = []
  if (waveRAF !== null) {
    cancelAnimationFrame(waveRAF)
    waveRAF = null
  }
  cleanups.forEach(fn => fn())
  cleanups.length = 0
}

onMounted(() => {
  // Respect reduced-motion: skip BOTH motions. The static "AI <firstWord>" and
  // empty dot-field already render; nothing else to do.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  buildField()
  startWave()
  // Cycling only makes sense with ≥2 words; one word stays static (caret blinks).
  if (props.words.length > 1) typeLoop()
})

onBeforeUnmount(() => {
  stopAll()
})
</script>

<template>
  <section ref="heroEl" class="home-hero">
    <div ref="dotfieldEl" class="home-hero__dotfield" aria-hidden="true" />

    <div class="home-hero__inner">
      <p class="home-hero__eyebrow">{{ eyebrow }}</p>
      <h1 class="home-hero__headline">
        <span class="home-hero__stem">{{ headline }}</span>
        <span class="home-hero__word-wrap">
          <span ref="wordEl" class="home-hero__word">{{ firstWord }}</span><span class="home-hero__caret" aria-hidden="true" />
        </span>
      </h1>
      <p class="home-hero__sub">{{ subhead }}</p>
      <div class="home-hero__links">
        <a v-if="ctas[0]" class="home-hero__link" :href="ctas[0].target">
          {{ ctas[0].label }} <span aria-hidden="true">↗</span>
        </a>
        <NuxtLink v-if="ctas[1]" class="home-hero__link home-hero__link--dim" :to="ctas[1].target">
          {{ ctas[1].label }} <span aria-hidden="true">↗</span>
        </NuxtLink>
      </div>
    </div>

    <div class="home-hero__hint home-hero__hint--bl">Index — 01 / 05</div>
    <a class="home-hero__hint home-hero__hint--br" href="#work">Scroll ↓</a>
  </section>
</template>
