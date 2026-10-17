<!-- Prompt gallery card: category, audience, title and one-line description. -->
<script setup lang="ts">
interface Props {
  /** Full route path (e.g. '/prompts/foo'), passed through as-is. */
  to: string
  title: string
  category: string
  audience: string
  description: string
  draft?: boolean
}

defineProps<Props>()
</script>

<template>
  <NuxtLink :to="to" class="post-card prompt-card" data-reveal>
    <div class="post-card__meta mono">
      <span>{{ category }}</span>
      <template v-if="draft">
        <span class="post-card__sep" aria-hidden="true">/</span>
        <span class="prompt-draft">Draft</span>
      </template>
    </div>
    <h3 class="post-card__title">{{ title }}</h3>
    <p class="post-card__dek">{{ description }}</p>
    <p class="prompt-card__for mono">For: {{ audience }}</p>
    <span class="prompt-card__cta mono">Get the prompt <span aria-hidden="true">→</span></span>
  </NuxtLink>
</template>
