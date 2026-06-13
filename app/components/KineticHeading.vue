<!--
  KineticHeading — hero headline for the redesign (PRO-111, U2).

  Replaces TypewriterHeadline. SSR renders the canonical first phrase as REAL
  text (prefix + words[0], or the static `text`), so prerendered HTML stays
  SEO-/no-JS-safe and there is no hydration mismatch. On the client it ENHANCES
  that existing text:
    - a GSAP SplitText reveal animates the headline characters into place on mount;
    - for the home headline (words.length > 1) it then cycles the trailing word
      (EXPERIMENTS → CONSULTING → TRAINING …) via a GSAP timeline.
  The "AI " prefix (or any prefix) stays fixed and is never animated out.

  Respects prefers-reduced-motion: bails before splitting / cycling, leaving the
  static SSR text exactly in place. SSR-safe — all GSAP work lives in onMounted
  and is reverted/killed on unmount (page transitions are out-in, so the DOM must
  be restored). GSAP is provided client-only via app/plugins/gsap.client.ts
  ($gsap / $SplitText); we never import gsap at module scope.

  The <h1> is consumed via HeroSection's #headline slot, so the global `.hero h1`
  rule in sections.css styles it — no headline font CSS is duplicated here.
-->
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'

interface Props {
  /** Trailing words cycled after the fixed prefix (home headline). */
  words?: string[]
  /** Fixed leading text, kept static (never animated out). */
  prefix?: string
  /** Static single-line headline (consulting). Wins over words when set. */
  text?: string
  /** Accessible name for the <h1>. Defaults derived from prefix + first word / text. */
  label?: string
  /** Hold (ms) on a fully-shown word before rotating to the next. */
  holdMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  words: () => ['EXPERIMENTS', 'CONSULTING', 'TRAINING'],
  prefix: 'AI ',
  text: undefined,
  label: undefined,
  holdMs: 2200,
})

const reduced = useReducedMotion()

// Static mode = an explicit `text`, or a single-element word list.
const isStatic = computed(() => props.text != null || props.words.length <= 1)
const firstWord = computed(() => props.words[0] ?? '')
const ariaLabel = computed(
  () => props.label ?? (props.text != null ? props.text : `${props.prefix}${firstWord.value}`),
)

const headingEl = ref<HTMLElement | null>(null)
const wordEl = ref<HTMLElement | null>(null)

// GSAP handles, all torn down on unmount.
let split: { revert: () => void } | null = null
let revealTween: { kill: () => void } | null = null
let rotateTl: { kill: () => void } | null = null
let cancelled = false

onMounted(async () => {
  // Reduced-motion: leave the static SSR text untouched (no split, no rotation).
  if (reduced.value) return

  const { $gsap, $SplitText } = useNuxtApp() as unknown as {
    $gsap?: typeof import('gsap')['gsap']
    $SplitText?: typeof import('gsap/SplitText')['SplitText']
  }
  if (!$gsap || !headingEl.value) return

  // Reveal: split the headline into chars and stagger them up into place.
  try {
    if ($SplitText) {
      const st = new $SplitText(headingEl.value, { type: 'chars' }) as unknown as {
        chars: Element[]
        revert: () => void
      }
      split = st
      revealTween = $gsap.from(st.chars, {
        yPercent: 110,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.025,
      })
    } else {
      // No SplitText: reveal the whole heading as one block.
      revealTween = $gsap.from(headingEl.value, { yPercent: 8, opacity: 0, duration: 0.7, ease: 'power3.out' })
    }
  } catch {
    // SplitText failed (e.g. fonts not ready) — leave the static text visible.
    split = null
  }

  if (cancelled || isStatic.value) return

  // Home headline only: rotate the trailing word on a loop. Built as a GSAP
  // timeline so it's a single killable handle and respects the reveal first.
  const words = props.words
  let index = 0
  const rotate = () => {
    if (cancelled || !wordEl.value) return
    const next = (index + 1) % words.length
    const tl = $gsap.timeline({
      onComplete: () => {
        index = next
        if (!cancelled) rotate()
      },
    })
    rotateTl = tl
    tl.to(wordEl.value, { yPercent: -100, opacity: 0, duration: 0.4, ease: 'power2.in', delay: props.holdMs / 1000 })
      .add(() => {
        if (wordEl.value) wordEl.value.textContent = words[next] ?? ''
      })
      .set(wordEl.value, { yPercent: 100, opacity: 0 })
      .to(wordEl.value, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' })
  }
  // Kick off the rotation after the reveal has had time to play.
  rotateTl = $gsap.delayedCall(1.2, rotate) as unknown as { kill: () => void }
})

onBeforeUnmount(() => {
  cancelled = true
  rotateTl?.kill()
  revealTween?.kill()
  // Revert SplitText LAST so the original DOM text is restored after tweens die
  // (page transitions are out-in; the next mount must see clean markup).
  split?.revert()
})
</script>

<template>
  <h1 ref="headingEl" :aria-label="ariaLabel">
    <template v-if="isStatic">
      <span aria-hidden="true">{{ text != null ? text : `${prefix}${firstWord}` }}</span>
    </template>
    <template v-else>
      <span aria-hidden="true">{{ prefix }}<span ref="wordEl" class="kinetic-word">{{ firstWord }}</span></span>
    </template>
  </h1>
</template>

<style scoped>
.kinetic-word {
  display: inline-block;
  white-space: pre;
}
</style>
