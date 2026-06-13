<!--
  Leaf component for the experiments grid (PRO-112 dark redesign).

  Dark card: a --raised shot surface, a mono index label that tints --accent on
  hover/focus, a CSS hover image scale, and two client-only scroll enhancements:
    - useScrollReveal(cardEl): one-shot reveal as the card scrolls in.
    - an inline ScrollTrigger parallax that drifts the (oversized) image inside
      the fixed-aspect .shot frame as the page scrolls.

  Progressive-enhancement contract (R7): the SSR / no-JS / reduced-motion render
  is the COMPLETE static card — no hidden start state is ever in the server HTML.
  useScrollReveal applies its hidden state only in onMounted on the client, and
  the parallax bails before reduced-motion. GSAP is imported dynamically inside
  onMounted so it never enters the SSR bundle (mirrors useScrollReveal /
  HeroScene). .stripes always renders behind any image so a missing/broken image
  falls through visually. Styles live in app/assets/css/sections.css.
-->
<script setup lang="ts">
import { ref, computed, onMounted, onScopeDispose } from 'vue'
import { useReducedMotion } from '~/composables/useReducedMotion'
import { useScrollReveal } from '~/composables/useScrollReveal'

interface Props {
  idx: number
  title: string
  tag: string
  href: string
  image?: string
  alt: string
  // Optional terser accessible name; falls back to `title` when absent.
  // Matches the prototype where BATCH SQUOOSH spoke as "Squoosh".
  ariaLabel?: string
}

const props = defineProps<Props>()

// Idx label is presentation; data layer stores plain numbers (plan K3).
// `padIndex` is auto-imported from `app/utils/format.ts` (PRO-95).
const idxLabel = computed(() => padIndex(props.idx))
const accessibleName = computed(() => props.ariaLabel ?? props.title)

const cardEl = ref<HTMLElement | null>(null)
// A template ref on the <NuxtImg> component resolves to the component proxy, not
// the underlying <img>; we read the DOM node from the card subtree in onMounted
// instead so GSAP always receives a real Element.
const reduced = useReducedMotion()

// One-shot reveal of the whole card as it scrolls in. SSR-safe: the composable
// is a no-op on the server and under reduced-motion, so the served markup is the
// complete static card (R7).
useScrollReveal(cardEl)

// Continuous parallax: drift the image within the .shot overflow as the page
// scrolls. This is a scrubbed tween — a different shape from the one-shot reveal
// — so it lives here rather than in useScrollReveal (KTD1). Enhancement-only:
// bails on SSR (onMounted is client-only) and reduced-motion, leaving a static
// centered image. The image is sized past the frame in CSS (KTD2) so the drift
// never reveals the surface edge and the card box never moves (no layout shift).
let cleanup: (() => void) | undefined

onMounted(async () => {
  if (reduced.value) return
  const card = cardEl.value
  if (!card) return
  // Resolve the real <img> from the card subtree (NuxtImg renders a plain <img>).
  // Cards without an `image` prop render no <img>, so parallax is skipped.
  const img = card.querySelector('.shot img')
  if (!img) return

  const { gsap } = await import('gsap')
  const { ScrollTrigger } = await import('gsap/ScrollTrigger')
  gsap.registerPlugin(ScrollTrigger)

  const tween = gsap.fromTo(
    img,
    { yPercent: -6 },
    {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    },
  )

  cleanup = () => {
    tween.scrollTrigger?.kill()
    tween.kill()
  }
})

onScopeDispose(() => {
  cleanup?.()
})
</script>

<template>
  <a
    ref="cardEl"
    class="experiment"
    :href="href"
    target="_blank"
    rel="noopener"
    :aria-label="accessibleName"
  >
    <div class="shot">
      <div class="stripes" aria-hidden="true" />
      <NuxtImg
        v-if="image"
        :src="image"
        :alt="alt"
        loading="lazy"
      />
    </div>
    <div class="experiment-caption">
      <span class="idx">{{ idxLabel }}</span>
      <div class="title-block">
        <h3>{{ title }}</h3>
        <span class="tag">{{ tag }}</span>
      </div>
      <span class="arrow" aria-hidden="true">↗</span>
    </div>
  </a>
</template>
