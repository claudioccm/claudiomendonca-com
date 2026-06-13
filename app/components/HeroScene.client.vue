<!--
  HeroScene — fullscreen WebGL shader plane behind the hero (PRO-111, U3).

  CLIENT ONLY by construction:
    - the `.client.vue` suffix keeps it out of the SSR / prerender graph entirely;
    - it is additionally wrapped in <ClientOnly> at its mount site in HeroSection;
    - `three` is loaded via a dynamic import() inside onMounted, so the heavy lib
      never enters the server bundle (mirrors useScrollReveal's dynamic GSAP import).

  Renders a single fullscreen plane with a ShaderMaterial: a slow flowing gradient
  glowing in the accent (#6980ff). Cheap fragment shader — no post-processing, no
  loops. Performance guards:
    - DPR capped at 1.5 (renderer.setPixelRatio);
    - the rAF loop PAUSES when the hero scrolls off-screen (IntersectionObserver)
      and when the tab is hidden (visibilitychange), and resumes on re-entry;
    - everything is disposed on unmount (no leaked GL context / geometry / material).

  Defense in depth: this component is only mounted when useWebGLCapable() is true
  (HeroSection gates it), but it also guards WebGL-context-creation failure by
  emitting `fail` so the parent can fall back. aria-hidden + pointer-events:none —
  purely decorative, never interactive, never focusable.
-->
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
// Type-only import: erased at compile time, so `three` never enters the runtime
// or SSR bundle. The actual library loads via the dynamic import() in onMounted.
import type * as THREE_NS from 'three'

const emit = defineEmits<{ (e: 'fail'): void }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)

// Module-scope-free state: everything created in onMounted, torn down on unmount.
let renderer: THREE_NS.WebGLRenderer | null = null
let frame = 0
let running = false
let visible = true
let tabVisible = true
let io: IntersectionObserver | null = null
let onResize: (() => void) | null = null
let onVisibility: (() => void) | null = null
let disposers: Array<() => void> = []
let uTime: { value: number } | null = null
let uRes: { value: THREE_NS.Vector2 } | null = null
let startTime = 0
// Set in onBeforeUnmount. Guards the async onMounted body: if the component
// unmounts while `await import('three')` is in flight, the continuation must
// not create a renderer / observers / listeners that the (already-run) teardown
// can't see — that would leak a GL context. We bail (and dispose) after the await.
let cancelled = false

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 uAccent;

  // Cheap value-noise-ish flow: layered sines, no loops over textures.
  float wave(vec2 p, float t) {
    return 0.5 + 0.5 * sin(p.x * 2.2 + t) * cos(p.y * 1.8 - t * 0.7);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes.xy;
    float t = uTime * 0.25;
    float w = wave(uv * 3.0, t) * 0.6 + wave(uv * 6.0 + 1.7, t * 1.3) * 0.4;
    // Dark near-black base, accent glow concentrated toward the lower-left.
    vec3 base = vec3(0.031, 0.031, 0.039); // ~ --ink #08080a
    float glow = smoothstep(0.2, 1.0, w) * (1.0 - distance(uv, vec2(0.28, 0.32)));
    vec3 col = base + uAccent * max(glow, 0.0) * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }
`

const VERT = /* glsl */ `
  void main() { gl_Position = vec4(position, 1.0); }
`

// Held in closure-visible refs assigned during init.
let sceneRef: THREE_NS.Scene | null = null
let cameraRef: THREE_NS.Camera | null = null

function renderOnce() {
  if (!renderer || !uTime || !sceneRef || !cameraRef) return
  uTime.value = (performance.now() - startTime) / 1000
  renderer.render(sceneRef, cameraRef)
}

function tick() {
  if (!running) return
  renderOnce()
  frame = requestAnimationFrame(tick)
}

function maybeRun() {
  const shouldRun = visible && tabVisible
  if (shouldRun && !running) {
    running = true
    startTime = performance.now() - (uTime?.value ?? 0) * 1000
    frame = requestAnimationFrame(tick)
  } else if (!shouldRun && running) {
    running = false
    cancelAnimationFrame(frame)
  }
}

onMounted(async () => {
  const canvas = canvasEl.value
  if (!canvas) return

  let THREE: typeof import('three')
  try {
    THREE = await import('three')
  } catch {
    emit('fail')
    return
  }

  // Unmounted while the dynamic import was in flight — teardown already ran and
  // can't see anything we'd create now, so stop before allocating GL resources.
  if (cancelled) return

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' })
  } catch {
    emit('fail')
    return
  }
  // Re-check: a renderer created after teardown ran would leak its GL context.
  if (cancelled) {
    renderer.dispose()
    renderer = null
    return
  }

  const scene = new THREE.Scene()
  const camera = new THREE.Camera()
  sceneRef = scene
  cameraRef = camera

  uTime = { value: 0 }
  uRes = { value: new THREE.Vector2(canvas.clientWidth || 1, canvas.clientHeight || 1) }

  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime,
      uRes,
      uAccent: { value: new THREE.Color(0x6980ff) },
    },
    depthTest: false,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const size = () => {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer!.setPixelRatio(dpr)
    renderer!.setSize(w, h, false)
    uRes?.value.set(w * dpr, h * dpr)
  }
  size()
  onResize = size
  window.addEventListener('resize', size, { passive: true })

  // Pause when the hero scrolls out of view.
  io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true
      maybeRun()
    },
    { threshold: 0 },
  )
  io.observe(canvas)

  // Pause when the tab is hidden.
  onVisibility = () => {
    tabVisible = document.visibilityState !== 'hidden'
    maybeRun()
  }
  document.addEventListener('visibilitychange', onVisibility)
  tabVisible = document.visibilityState !== 'hidden'

  disposers = [
    () => geometry.dispose(),
    () => material.dispose(),
    () => renderer?.dispose(),
  ]

  // First paint + start the loop.
  renderOnce()
  maybeRun()
})

onBeforeUnmount(() => {
  cancelled = true
  running = false
  cancelAnimationFrame(frame)
  io?.disconnect()
  io = null
  if (onResize) window.removeEventListener('resize', onResize)
  if (onVisibility) document.removeEventListener('visibilitychange', onVisibility)
  onResize = null
  onVisibility = null
  for (const d of disposers) {
    try {
      d()
    } catch {
      /* best-effort GL teardown */
    }
  }
  disposers = []
  renderer = null
  sceneRef = null
  cameraRef = null
  uTime = null
  uRes = null
})
</script>

<template>
  <canvas ref="canvasEl" class="hero-scene" aria-hidden="true" />
</template>

<style scoped>
.hero-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
