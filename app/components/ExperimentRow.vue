<!-- Linked tool row. External-link semantics and accessible names are preserved. -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  /** Mono right-hand description. Falls back to nothing if empty. */
  description: string
  href: string
  /** Optional terser accessible name; falls back to `title`. */
  ariaLabel?: string
}

const props = defineProps<Props>()

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
    <span class="experiment-row__title">{{ title }}</span>
    <span class="experiment-row__desc mono">
      {{ description }}
      <span class="experiment-row__arrow" aria-hidden="true">↗</span>
    </span>
  </a>
</template>
