<!--
  Leaf component for the experiments grid. Prop-driven, CSS-only hover,
  SSR-safe. Styles live in app/assets/css/sections.css (lifted from prototype
  styles.css lines 377–471). Plan K3: .stripes always renders behind any
  image so a missing/broken image falls through visually.
-->
<script setup lang="ts">
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
const idxLabel = computed(() => String(props.idx).padStart(2, '0'))
const accessibleName = computed(() => props.ariaLabel ?? props.title)
</script>

<template>
  <a
    class="experiment"
    :href="href"
    role="listitem"
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
