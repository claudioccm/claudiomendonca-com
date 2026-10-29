<!-- /prompts/<slug>: a prompt (PromptDetail) or a downloadable skill (SkillDetail).
     Both collections share the /prompts path; prompts are checked first. -->
<script setup lang="ts">
const route = useRoute()

const { data: entry } = await useAsyncData(`prompts-${route.path}`, async () => {
  const prompt = await queryCollection('prompts').path(route.path).first()
  if (prompt) return { prompt, skill: null }
  const skill = await queryCollection('skills').path(route.path).first()
  return skill ? { prompt: null, skill } : null
})

// Drafts render in dev and on Netlify previews only (see prompts/index.vue).
const doc = entry.value?.prompt ?? entry.value?.skill
if (!doc || (doc.draft && !useRuntimeConfig().public.showPromptDrafts)) {
  throw createError({ statusCode: 404, statusMessage: 'Prompt not found', fatal: true })
}
</script>

<template>
  <PromptDetail v-if="entry?.prompt" :doc="entry.prompt" />
  <SkillDetail v-else-if="entry?.skill" :doc="entry.skill" />
</template>
