<!--
  Client-enhanced hero headline. SSR renders the canonical first phrase
  ("AI EXPERIMENTS") as real text so the prerendered HTML stays SEO-/no-JS-safe;
  on the client it cycles the trailing word through `words` with a typewriter +
  scramble reveal. The "AI " prefix stays fixed. Respects prefers-reduced-motion
  (stays static) and is SSR-safe (animation lives in onMounted). The visible text
  is aria-hidden and the <h1> carries a stable aria-label so screen readers get
  one clean name instead of the per-frame scramble noise.

  The <h1> is consumed via HeroSection's #headline slot, so the global
  `.hero h1` rule in sections.css styles it — no headline CSS is duplicated here.
-->
<script setup lang="ts">
interface Props {
  /** Trailing words cycled after the fixed prefix. */
  words?: string[]
  /** Fixed leading text (kept static, never scrambled). */
  prefix?: string
  /** Frames each character stays scrambled before locking (≈ speed). */
  scrambleFrames?: number
  /** Pause on a fully-resolved word before scrambling to the next (ms). */
  holdMs?: number
  /** Per-frame chance (0–1) a scrambling glyph re-rolls — flicker intensity. */
  rerollChance?: number
  /** Caret blink period in ms (while a word rests). */
  caretBlinkMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  words: () => ['EXPERIMENTS', 'CONSULTING', 'TRAINING'],
  prefix: 'AI ',
  scrambleFrames: 14,
  holdMs: 1500,
  rerollChance: 0.28,
  caretBlinkMs: 1050,
})

const wordEl = ref<HTMLElement | null>(null)
// Caret is solid while typing/scrambling, blinks (via CSS) while a word rests.
const isTyping = ref(false)

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}=+*^?#'

let rafId = 0
let holdTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  // No animation for reduced-motion users — leave the static SSR word in place.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let index = 0

  // Animate `from` → `to`. Each character gets a random reveal window so the
  // word resolves left-ish-to-right while unsettled positions show random
  // glyphs (typewriter feel + scramble). Resolves a Promise when settled.
  const transition = (from: string, to: string) =>
    new Promise<void>((resolve) => {
      const length = Math.max(from.length, to.length)
      const queue = Array.from({ length }, (_, i) => {
        const target = to[i] ?? ''
        const start = Math.floor(Math.random() * props.scrambleFrames)
        const end = start + Math.floor(Math.random() * props.scrambleFrames) + props.scrambleFrames
        return { target, start, end, char: '' }
      })

      let frame = 0
      const tick = () => {
        let output = ''
        let done = 0
        for (const item of queue) {
          if (frame >= item.end) {
            done++
            output += item.target
          } else if (frame >= item.start) {
            // Re-roll the scramble glyph occasionally for a flickering feel.
            if (!item.char || Math.random() < props.rerollChance) {
              item.char = CHARS[Math.floor(Math.random() * CHARS.length)]!
            }
            output += item.char
          }
        }
        if (wordEl.value) wordEl.value.textContent = output
        if (done === queue.length) {
          resolve()
          return
        }
        frame++
        rafId = requestAnimationFrame(tick)
      }
      tick()
    })

  const loop = async () => {
    const current = props.words[index] ?? ''
    const next = props.words[(index + 1) % props.words.length] ?? ''
    isTyping.value = true
    await transition(current, next)
    isTyping.value = false
    index = (index + 1) % props.words.length
    holdTimer = setTimeout(loop, props.holdMs)
  }

  // First hold keeps the SSR word visible briefly before the first scramble.
  holdTimer = setTimeout(loop, props.holdMs)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  if (holdTimer) clearTimeout(holdTimer)
})
</script>

<template>
  <h1 aria-label="AI Experiments">
    <span aria-hidden="true">{{ prefix }}<span ref="wordEl" class="scramble-word">{{ words[0] }}</span><span class="caret" :class="{ 'caret--solid': isTyping }" :style="{ '--caret-blink': caretBlinkMs + 'ms' }">|</span></span>
  </h1>
</template>

<style scoped>
.scramble-word {
  /* No reserved width: the caret hugs the visible text and walks right as the
     word types in (true typewriter feel). Only the trailing edge moves, which
     sits below nothing — the sub/CTA rows are unaffected. */
  white-space: pre;
}

/* Typewriter caret. Solid while typing/scrambling, blinks while a word rests. */
.caret {
  display: inline-block;
  margin-left: 0.04em;
  font-weight: var(--font-weight-medium);
  animation: caret-blink var(--caret-blink, 1.05s) steps(1) infinite;
}
.caret--solid {
  animation: none;
  opacity: 1;
}
@keyframes caret-blink {
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .caret { animation: none; }
}
</style>
