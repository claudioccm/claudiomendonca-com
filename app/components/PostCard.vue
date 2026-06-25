<!--
  Leaf card for the Writing grid (PRO-178).

  Mirrors ExperimentCard's conventions: a diagonal-hatch cover placeholder
  (.hatch, pure CSS — no image asset), a mono meta row
  (category / date / read-time), a serif title, and a dek. Wraps a NuxtLink to
  the post route so client-side nav + prerender crawling both work.

  The card carries `data-reveal` so it fades in on scroll via the CSS
  [data-reveal] utility (base.css) — double-guarded for reduced-motion / no-JS,
  so the served markup is the complete static card. Styles live in
  app/assets/css/sections.css under the Writing block.
-->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** Full route path for the post (e.g. '/writing/foo'), passed through as-is. */
  to: string
  title: string
  category: string
  date: string
  readingTime?: number
  dek?: string
}

const props = defineProps<Props>()

const dateLabel = computed(() => formatMonthYear(props.date))
const readLabel = computed(() =>
  props.readingTime ? `${props.readingTime} min` : null,
)
</script>

<template>
  <NuxtLink :to="to" class="post-card" data-reveal>
    <div class="post-card__cover hatch" aria-hidden="true" />
    <div class="post-card__meta mono">
      <span>{{ category }}</span>
      <span class="post-card__sep" aria-hidden="true">/</span>
      <span>{{ dateLabel }}</span>
      <template v-if="readLabel">
        <span class="post-card__sep" aria-hidden="true">/</span>
        <span>{{ readLabel }}</span>
      </template>
    </div>
    <h3 class="post-card__title">{{ title }}</h3>
    <p v-if="dek" class="post-card__dek">{{ dek }}</p>
  </NuxtLink>
</template>
