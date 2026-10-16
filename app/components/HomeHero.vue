<!-- Home hero. The full first question renders server-side; motion respects reduced-motion preferences. -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Cta {
  label: string
  target: string
}

interface Props {
  /** Upright headline stem, e.g. "Still". */
  headline: string
  /** Italic words cycled by the typewriter. words[0] is the static SSR render. */
  words: string[]
  subhead: string
  /** Two CTAs: [0] on-page contact form (button), [1] in-page problems anchor. */
  ctas: Cta[]
}

const props = defineProps<Props>()

// First word is rendered server-side so "Still <question>" is in the SSR HTML.
const firstWord = props.words[0] ?? ''

const heroEl = ref<HTMLElement | null>(null)
const wordEl = ref<HTMLElement | null>(null)
const water = ref<{ textRipple: (word: DOMRect | null, headline: DOMRect | null) => void } | null>(null)

// How long each word holds before it retypes.
const HOLD_MS = 3000

// --- mutable animation state (closures, not reactive) ---
let timers: number[] = []
let wi = 0

/* ---------- typewriter ---------- */
function typeLoop() {
  const el = wordEl.value
  if (!el) return
  const hold = window.setTimeout(() => {
    delWord(el, () => {
      wi = (wi + 1) % props.words.length
      rippleFromText()
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

/* ---------- water ---------- */
// The water calms down behind the whole content block, headline through the
// client logos, so the copy stays readable (Claudio 2026-10-16).
function calmTargets(): Element[] {
  const hero = heroEl.value
  if (!hero) return []
  return Array.from(hero.querySelectorAll(
    '.home-hero__question--measure, .home-hero__sub, .home-hero__links, .client-logos__label, .client-logos__list > li',
  ))
}

// Medium ripple from the headline each time the word changes.
function rippleFromText() {
  const h = heroEl.value?.querySelector('.home-hero__question:not(.home-hero__question--measure)')
  water.value?.textRipple(wordEl.value?.getBoundingClientRect() ?? null, h?.getBoundingClientRect() ?? null)
}

function stopAll() {
  timers.forEach(id => clearTimeout(id))
  timers = []
}

onMounted(() => {
  // Respect reduced-motion: the static "Still <firstWord>" already renders and
  // HeroAsciiWater draws a single still frame on its own.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Cycling only makes sense with ≥2 words; one word stays static (caret blinks).
  if (props.words.length > 1) typeLoop()
})

onBeforeUnmount(() => {
  stopAll()
})
</script>

<template>
  <section ref="heroEl" class="home-hero">
    <HeroAsciiWater ref="water" :calm-targets="calmTargets" />

    <div class="home-hero__inner">
      <h1 class="home-hero__headline" :aria-label="`${headline} ${firstWord}`">
        <span class="home-hero__question" aria-hidden="true">
          {{ headline }} <span ref="wordEl" class="home-hero__word">{{ firstWord }}</span><span class="home-hero__caret" />
        </span>
        <!-- Reserve the natural height of every question so typing never moves the content below. -->
        <span v-for="word in words" :key="word" class="home-hero__question home-hero__question--measure" aria-hidden="true">
          {{ headline }} <span class="home-hero__word">{{ word }}</span><span class="home-hero__caret" />
        </span>
      </h1>
      <p class="home-hero__sub">{{ subhead }}</p>
      <div class="home-hero__links">
        <!-- Primary CTA is a real button to the on-page form (#contact);
             both targets stay on this page, so the arrows point → and ↓. -->
        <a v-if="ctas[0]" class="btn btn-filled home-hero__btn" :href="ctas[0].target">
          {{ ctas[0].label }} <span aria-hidden="true">→</span>
        </a>
        <NuxtLink v-if="ctas[1]" class="home-hero__link home-hero__link--dim" :to="ctas[1].target">
          {{ ctas[1].label }} <span aria-hidden="true">↓</span>
        </NuxtLink>
      </div>
      <slot />
    </div>
  </section>
</template>
