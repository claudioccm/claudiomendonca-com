<!-- Prompt gallery card: category, audience, title and one-line description.
     A skill (kind 'skill') shows a Skill label in place of the category. -->
<script setup lang="ts">
interface Props {
  /** Full route path (e.g. '/prompts/foo'), passed through as-is. */
  to: string
  title: string
  category: string
  audience: string
  description: string
  draft?: boolean
  kind?: 'prompt' | 'skill'
}

withDefaults(defineProps<Props>(), { kind: 'prompt' })
</script>

<template>
  <NuxtLink :to="to" class="post-card prompt-card" data-reveal>
    <div class="post-card__meta mono">
      <span v-if="kind === 'skill'" class="prompt-card__kind">Skill</span>
      <span v-else>{{ category }}</span>
      <template v-if="draft">
        <span class="post-card__sep" aria-hidden="true">/</span>
        <span class="prompt-draft">Draft</span>
      </template>
    </div>
    <h3 class="post-card__title">{{ title }}</h3>
    <p class="post-card__dek">{{ description }}</p>
    <p class="prompt-card__for mono">For: {{ audience }}</p>
    <span class="prompt-card__cta mono">{{ kind === 'skill' ? 'Get the skill' : 'Get the prompt' }} <span aria-hidden="true">→</span></span>
  </NuxtLink>
</template>
