<!-- Prompt gallery index with category filtering (/prompts). -->
<script setup lang="ts">
import { computed, ref } from 'vue'

// Drafts are listed (badged) in dev and on Netlify previews only, so Claudio
// can review them; production builds never prerender or link them.
const showDrafts = useRuntimeConfig().public.showPromptDrafts

const { data: prompts } = await useAsyncData('prompts-index', () => {
  const query = queryCollection('prompts').order('date', 'DESC')
  return showDrafts ? query.all() : query.where('draft', '=', false).all()
})

// Skills share the grid (2026-10-29), newest first among the prompts, under
// their own "Skills" chip.
const { data: skills } = await useAsyncData('skills-index', () => {
  const query = queryCollection('skills').order('date', 'DESC')
  return showDrafts ? query.all() : query.where('draft', '=', false).all()
})

const SKILLS_CHIP = 'Skills'

// Each item is filed under one chip: its category, or "Skills".
const items = computed(() => [
  ...(prompts.value ?? []).map(p => ({ ...p, group: p.category as string, kind: 'prompt' as const })),
  ...(skills.value ?? []).map(s => ({ ...s, category: 'Skill', group: SKILLS_CHIP, kind: 'skill' as const })),
].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)))

// Chips follow the groups present in the listed items, like /writing.
const chips = computed<{ label: string, category: string | null }[]>(() => {
  const present: string[] = []
  for (const item of items.value) {
    if (!present.includes(item.group)) present.push(item.group)
  }
  return [{ label: 'All', category: null }, ...present.map(c => ({ label: c, category: c }))]
})

const activeCategory = ref<string | null>(null) // null = All

const visible = computed(() =>
  activeCategory.value === null
    ? items.value
    : items.value.filter(item => item.group === activeCategory.value),
)

const canonical = 'https://ccm-labs.ca/prompts'
const title = 'Free AI prompts for small businesses — CCM Labs'
const description
  = 'Copy-paste AI prompts for quotes, reviews, job notes and customer follow-ups. Free, no sign-up. Swap the brackets, read what comes back, then send it.'
useHead({ link: [{ rel: 'canonical', href: canonical }] })
useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: canonical,
  twitterTitle: title,
  twitterDescription: description,
})
</script>

<template>
  <div>
    <section class="writing-header">
      <div class="shell">
        <h1 class="writing-header__title" data-reveal>Prompts.</h1>
        <p class="writing-header__dek" data-reveal>
          Copy-paste prompts for the work that keeps coming back: quotes, reviews, job notes,
          follow-ups. Free, no sign-up. Swap the brackets for your own details. Skills are files you
          install once, so your AI works the same way every time. AI drafts. You sign.
        </p>

        <ul class="filter-chips mono" data-reveal aria-label="Filter prompts by category">
          <li v-for="chip in chips" :key="chip.label">
            <button
              type="button"
              class="filter-chips__item"
              :class="{ 'is-active': activeCategory === chip.category }"
              :aria-pressed="activeCategory === chip.category"
              @click="activeCategory = chip.category"
            >
              {{ chip.label }}
            </button>
          </li>
        </ul>
      </div>
    </section>

    <section class="writing-grid-section">
      <div class="shell">
        <div v-if="visible.length" class="prompt-grid-wrap">
          <ul class="prompt-grid" aria-label="Prompts">
            <li v-for="prompt in visible" :key="prompt.path">
              <PromptCard
                :to="prompt.path"
                :title="prompt.title"
                :category="prompt.category"
                :audience="prompt.audience"
                :description="prompt.description"
                :draft="prompt.draft"
                :kind="prompt.kind"
              />
            </li>
          </ul>
        </div>
        <p v-else class="posts-empty mono">No prompts in this category yet.</p>
      </div>
    </section>
  </div>
</template>
