<!-- Writing card with publication metadata, title, and summary. -->
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
