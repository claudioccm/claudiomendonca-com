<!-- Linked tool row. External links open in a new tab (↗); a site path such as /refs
     is an in-site link (→). Accessible names are preserved. -->
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
const isInternal = computed(() => props.href.startsWith('/'))
</script>

<template>
  <NuxtLink
    v-if="isInternal"
    class="experiment-row"
    :to="href"
    :aria-label="accessibleName"
    data-reveal
  >
    <span class="experiment-row__title">{{ title }}</span>
    <span class="experiment-row__desc">
      {{ description }}
      <span class="experiment-row__arrow experiment-row__arrow--in" aria-hidden="true">→</span>
    </span>
  </NuxtLink>
  <a
    v-else
    class="experiment-row"
    :href="href"
    target="_blank"
    rel="noopener"
    :aria-label="accessibleName"
    data-reveal
  >
    <span class="experiment-row__title">{{ title }}</span>
    <span class="experiment-row__desc">
      {{ description }}
      <span class="experiment-row__arrow" aria-hidden="true">↗</span>
    </span>
  </a>
</template>
