<!--
  Client-enhanced hero headline. SSR renders the canonical first phrase
  ("AI EXPERIMENTS") as real text so the prerendered HTML stays SEO-/no-JS-safe;
  on the client it runs a typewriter loop over `words`: type a word in, hold,
  backspace it out, type the next. The "AI " prefix stays fixed. A blinking block
  cursor (a filled rectangle, not a caret) trails the text — solid while
  typing/deleting, blinking while a word rests.

  Respects prefers-reduced-motion (stays static, cursor stops blinking) and is
  SSR-safe (animation lives in onMounted, torn down on unmount). The visible text
  is aria-hidden and the <h1> carries a stable aria-label so screen readers get
  one clean name instead of the per-keystroke churn.

  The <h1> is consumed via HeroSection's #headline slot, so the global
  `.hero h1` rule in sections.css styles it — no headline CSS is duplicated here.
-->
<script setup lang="ts">
interface Props {
  /** Trailing words cycled after the fixed prefix. */
  words?: string[]
  /** Fixed leading text (kept static, never typed/deleted). */
  prefix?: string
  /** Delay between typed characters, ms. */
  typeMs?: number
  /** Delay between deleted characters, ms. */
  deleteMs?: number
  /** Pause on a fully-typed word before deleting, ms. */
  holdMs?: number
  /** Pause on the empty line between words, ms. */
  betweenMs?: number
  /** Cursor blink period while resting, ms. */
  cursorBlinkMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  words: () => ['EXPERIMENTS', 'CONSULTING', 'TRAINING'],
  prefix: 'AI ',
  typeMs: 90,
  deleteMs: 45,
  holdMs: 1600,
  betweenMs: 400,
  cursorBlinkMs: 1050,
})

const wordEl = ref<HTMLElement | null>(null)
// Hidden "N" in the same font; the block cursor is sized to match its width.
const measureEl = ref<HTMLElement | null>(null)
// Cursor width, set from the measured "N". Em fallback until JS measures (SSR).
const cursorWidth = ref('0.62em')
// Cursor is solid while typing/deleting, blinks (via CSS) while a word rests.
const isActive = ref(false)

let cancelled = false
let timer: ReturnType<typeof setTimeout> | undefined
let onResize: (() => void) | undefined

onMounted(() => {
  // Size the block cursor to a capital "N". Runs regardless of reduced-motion
  // (the cursor is shown either way). Re-measure on resize (font-size is vw-based)
  // and once webfonts load, since glyph metrics change.
  const measure = () => {
    if (measureEl.value) cursorWidth.value = `${measureEl.value.offsetWidth}px`
  }
  measure()
  onResize = measure
  window.addEventListener('resize', measure)
  document.fonts?.ready?.then(measure)

  // No typewriter animation for reduced-motion users — leave the static SSR word.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      timer = setTimeout(resolve, ms)
    })

  const setWord = (text: string) => {
    if (wordEl.value) wordEl.value.textContent = text
  }

  const typeWord = async (word: string) => {
    isActive.value = true
    for (let k = 1; k <= word.length; k++) {
      setWord(word.slice(0, k))
      await sleep(props.typeMs)
      if (cancelled) return
    }
    isActive.value = false
  }

  const deleteWord = async (word: string) => {
    isActive.value = true
    for (let k = word.length - 1; k >= 0; k--) {
      setWord(word.slice(0, k))
      await sleep(props.deleteMs)
      if (cancelled) return
    }
    isActive.value = false
  }

  const run = async () => {
    let index = 0
    // The SSR-rendered first word is already fully shown; start by resting on it.
    while (!cancelled) {
      await sleep(props.holdMs)
      if (cancelled) return
      await deleteWord(props.words[index] ?? '')
      if (cancelled) return
      index = (index + 1) % props.words.length
      await sleep(props.betweenMs)
      if (cancelled) return
      await typeWord(props.words[index] ?? '')
    }
  }

  run()
})

onBeforeUnmount(() => {
  cancelled = true
  if (timer) clearTimeout(timer)
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<template>
  <h1 aria-label="AI Experiments">
    <span aria-hidden="true">{{ prefix }}<span ref="wordEl" class="tw-word">{{ words[0] }}</span><span class="tw-cursor" :class="{ 'tw-cursor--solid': isActive }" :style="{ '--cursor-blink': cursorBlinkMs + 'ms', '--cursor-w': cursorWidth }" /><span ref="measureEl" class="tw-measure" aria-hidden="true">N</span></span>
  </h1>
</template>

<style scoped>
.tw-word {
  white-space: pre;
}

/* Hidden "N" used only to measure a capital glyph's width. Absolutely positioned
   so it never affects layout, but still rendered (offsetWidth is measurable). */
.tw-measure {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  white-space: pre;
  left: 0;
  top: 0;
}

/* Block cursor: a filled rectangle the size of a capital "N" (width measured in
   JS, height = cap height). Solid while typing/deleting, blinks while resting. */
.tw-cursor {
  display: inline-block;
  width: var(--cursor-w, 0.62em);
  /* Match the capital letters exactly: `1cap` is the font's cap height, so the
     block tracks the headline glyphs at any font-size. Em fallback for the rare
     engine without `cap` support. */
  height: 0.72em;
  height: 1cap;
  margin-left: 0.06em;
  background: currentColor;
  /* Block bottom sits on the baseline → its top lands at cap height, flush with
     the uppercase letters. */
  vertical-align: baseline;
  animation: tw-cursor-blink var(--cursor-blink, 1.05s) steps(1) infinite;
}
.tw-cursor--solid {
  animation: none;
  opacity: 1;
}
@keyframes tw-cursor-blink {
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .tw-cursor { animation: none; }
}
</style>
