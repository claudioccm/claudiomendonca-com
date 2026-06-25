<!--
  Leaf component for the experiments grid (PRO-112 dark redesign).

  Dark card: a --raised shot surface, a mono index label that tints --accent on
  hover/focus, and a CSS hover image scale. The card carries `data-reveal` so it
  fades in as it scrolls into view via the CSS `[data-reveal]` utility in
  base.css (PRO-174 — the GSAP reveal + image parallax were retired).

  Progressive-enhancement contract (R7): the SSR / no-JS / reduced-motion render
  is the COMPLETE static card — the `[data-reveal]` rule is guarded by
  `@supports` + `prefers-reduced-motion: no-preference`, so the served markup is
  fully visible with no hidden start state. .stripes always renders behind any
  image so a missing/broken image falls through visually. Styles live in
  app/assets/css/sections.css.
-->
<script setup lang="ts">
import { computed } from 'vue'

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
</script>

<template>
  <a
    class="experiment"
    :href="href"
    target="_blank"
    rel="noopener"
    :aria-label="accessibleName"
    data-reveal
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
        <h2>{{ title }}</h2>
        <span class="tag">{{ tag }}</span>
      </div>
      <span class="arrow" aria-hidden="true">↗</span>
    </div>
  </a>
</template>
