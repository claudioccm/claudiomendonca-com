<!--
  BrowTitle — renders a title inside a heading, lifting a "Start: rest" prefix
  into a brow (kicker) above it. Place it INSIDE the heading element so the
  heading's accessible name stays the full original title; the colon is kept
  for screen readers and hidden visually.
-->
<script setup lang="ts">
const props = defineProps<{ title: string }>()
const parts = computed(() => splitTitle(props.title))
</script>

<template>
  <template v-if="parts.brow">
    <span class="brow">{{ parts.brow }}</span><span class="sr-only">: </span>
  </template>{{ parts.title }}
</template>
