<!-- Writing archive with category filtering, featured article, and newsletter signup. -->
<script setup lang="ts">
import { computed, ref } from 'vue'

// All published posts, newest first. `draft` posts are excluded. Keyed for
// generate-safety (the result ships in the prerendered payload).
const { data: posts } = await useAsyncData('writing-index', () =>
  queryCollection('writing')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all(),
)

// The featured block uses the first `featured` post (exactly one is marked).
// The grid ("More posts") shows the remainder, in date order.
const featured = computed(() => posts.value?.find(p => p.featured) ?? null)
const rest = computed(() => (posts.value ?? []).filter(p => p !== featured.value))

// ---- Category filter chips (client-progressive) ----
// Chips are derived from the categories actually present in the published posts
// (not the full schema enum), so the bar only ever shows filters that match real
// content and stays in sync as posts are added or removed. 'All' (category: null)
// is the sentinel that disables filtering; the rest follow first-seen order
// (posts are newest-first).
const chips = computed<{ label: string, category: string | null }[]>(() => {
  const present: string[] = []
  for (const p of posts.value ?? []) {
    if (p.category && !present.includes(p.category)) present.push(p.category)
  }
  return [{ label: 'All', category: null }, ...present.map(c => ({ label: c, category: c }))]
})

const activeCategory = ref<string | null>(null) // null = All

const visibleRest = computed(() =>
  activeCategory.value === null
    ? rest.value
    : rest.value.filter(p => p.category === activeCategory.value),
)

// The featured block is hidden when a filter is active that the featured post
// doesn't match, so the page only ever shows posts in the chosen category.
const showFeatured = computed(
  () =>
    featured.value !== null &&
    (activeCategory.value === null ||
      featured.value.category === activeCategory.value),
)

// Empty state is only correct when NOTHING is shown for the active category —
// neither the featured block nor any grid card. Without the `showFeatured`
// guard the "Essays" chip would render the featured Essay block AND a
// contradictory "No posts in this category yet." below it (the sole Essay is
// the featured post, so it's excluded from `rest` and `visibleRest` is empty).
const noPostsVisible = computed(
  () => !showFeatured.value && visibleRest.value.length === 0,
)

// Canonical / og:url for /writing. Site base = https://ccm-labs.ca.
const canonical = 'https://ccm-labs.ca/writing'
useHead({ link: [{ rel: 'canonical', href: canonical }] })
const writingDescription
  = 'Notes on useful software, practical AI, and making everyday business work easier.'
useSeoMeta({
  title: 'Writing — Claudio Mendonça',
  description: writingDescription,
  ogTitle: 'Writing — Claudio Mendonça',
  ogDescription: writingDescription,
  ogUrl: canonical,
  twitterTitle: 'Writing — Claudio Mendonça',
  twitterDescription: writingDescription,
})
</script>

<template>
  <div>
    <!-- PAGE HEADER -->
    <section class="writing-header">
      <div class="shell">
        <h1 class="writing-header__title" data-reveal>The journal.</h1>
        <p class="writing-header__dek" data-reveal>
          {{ writingDescription }}
        </p>

        <!-- Category filter chips, derived from the posts' own categories. SSR
             renders them all; JS makes them filter. -->
        <ul class="filter-chips mono" data-reveal aria-label="Filter posts by category">
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

    <!-- FEATURED -->
    <section v-if="showFeatured && featured" class="writing-featured">
      <div class="shell">
        <NuxtLink :to="featured.path" class="post-featured" data-reveal>
          <div class="post-featured__body">
            <div class="post-featured__meta mono">
              <span>{{ featured.category }}</span>
              <span class="post-featured__sep" aria-hidden="true">/</span>
              <span>{{ formatMonthYear(featured.date) }}</span>
              <template v-if="featured.readingTime">
                <span class="post-featured__sep" aria-hidden="true">/</span>
                <span>{{ featured.readingTime }} min</span>
              </template>
            </div>
            <h2 class="post-featured__title">{{ featured.title }}</h2>
            <p v-if="featured.dek" class="post-featured__dek">{{ featured.dek }}</p>
            <span class="post-featured__cta mono">
              Read the essay
              <span class="post-featured__arrow" aria-hidden="true">↗</span>
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- GRID -->
    <section class="writing-grid-section">
      <div class="shell">
        <h2 v-if="visibleRest.length" class="writing-grid-section__head" data-reveal>More posts</h2>
        <ul v-if="visibleRest.length" class="posts-grid" aria-label="Posts">
          <li v-for="post in visibleRest" :key="post.path">
            <PostCard
              :to="post.path"
              :title="post.title"
              :category="post.category"
              :date="post.date"
              :reading-time="post.readingTime"
              :dek="post.dek"
            />
          </li>
        </ul>
        <!-- Only when neither the featured block nor any grid card is shown. -->
        <p v-if="noPostsVisible" class="posts-empty mono">No posts in this category yet.</p>
      </div>
    </section>

    <!-- NEWSLETTER (functional Resend-backed signup — PRO-179) -->
    <NewsletterBand />
  </div>
</template>
