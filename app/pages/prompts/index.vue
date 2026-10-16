<!-- Prompt gallery index with category filtering (/prompts). -->
<script setup lang="ts">
import { computed, ref } from 'vue'

// Drafts are listed (badged) in `nuxt dev` only, so Claudio can review them
// locally; `nuxt generate` never prerenders or links them.
const showDrafts = import.meta.dev

const { data: prompts } = await useAsyncData('prompts-index', () => {
  const query = queryCollection('prompts').order('date', 'DESC')
  return showDrafts ? query.all() : query.where('draft', '=', false).all()
})

// Chips follow the categories present in the listed prompts, like /writing.
const chips = computed<{ label: string, category: string | null }[]>(() => {
  const present: string[] = []
  for (const p of prompts.value ?? []) {
    if (!present.includes(p.category)) present.push(p.category)
  }
  return [{ label: 'All', category: null }, ...present.map(c => ({ label: c, category: c }))]
})

const activeCategory = ref<string | null>(null) // null = All

const visible = computed(() =>
  activeCategory.value === null
    ? prompts.value ?? []
    : (prompts.value ?? []).filter(p => p.category === activeCategory.value),
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
          follow-ups. Free, no sign-up. Swap the brackets for your own details. AI drafts. You sign.
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
        <ul v-if="visible.length" class="posts-grid" aria-label="Prompts">
          <li v-for="prompt in visible" :key="prompt.path">
            <PromptCard
              :to="prompt.path"
              :title="prompt.title"
              :category="prompt.category"
              :audience="prompt.audience"
              :description="prompt.description"
              :draft="prompt.draft"
            />
          </li>
        </ul>
        <p v-else class="posts-empty mono">No prompts in this category yet.</p>
      </div>
    </section>
  </div>
</template>
