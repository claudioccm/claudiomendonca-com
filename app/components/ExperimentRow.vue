<!--
  Experiments index row (editorial redesign — replaces the image-led
  ExperimentCard on the home page). One typographic row:

    NN · serif title · mono description ↗

  Ported from the prototype's `.exprow` index list
  (_process/design-exploration-unzipped/Hero - Combined.dc.html, EXPERIMENTS
  block). External link, opens in a new tab. Carries `data-reveal` for the
  CSS-only scroll fade (base.css). Hover state (bg tint + left-shift + arrow
  nudge) lives in app/assets/css/sections.css under `.experiment-row`.

  Progressive enhancement: the SSR / no-JS / reduced-motion render is the
  complete static row — no hidden start state, hover/reveal are pure CSS.
-->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 1-based position; rendered zero-padded ("01"). */
  idx: number
  title: string
  /** Mono right-hand description. Falls back to nothing if empty. */
  description: string
  href: string
  /** Optional terser accessible name; falls back to `title`. */
  ariaLabel?: string
}

const props = defineProps<Props>()

// `padIndex` is auto-imported from app/utils/format.ts (zero-pads to 2 digits).
const idxLabel = computed(() => padIndex(props.idx))
const accessibleName = computed(() => props.ariaLabel ?? props.title)
</script>

<template>
  <a
    class="experiment-row"
    :href="href"
    target="_blank"
    rel="noopener"
    :aria-label="accessibleName"
    data-reveal
  >
    <span class="experiment-row__idx mono">{{ idxLabel }}</span>
    <span class="experiment-row__title">{{ title }}</span>
    <span class="experiment-row__desc mono">
      {{ description }}
      <span class="experiment-row__arrow" aria-hidden="true">↗</span>
    </span>
  </a>
</template>
