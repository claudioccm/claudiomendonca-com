<!--
  Writing index — "The journal." (PRO-178).

  Spec: _process/design-exploration-unzipped/Blog.dc.html + screenshots
  01-blog2.png / 02-blog2.png. Page header (mono eyebrow + serif "The journal."
  + dek), category filter chips, a featured post block, a grid of PostCards, and
  the (stubbed) newsletter band.

  Posts come from the `writing` @nuxt/content collection (schema in
  content.config.ts, added in PRO-176) via queryCollection('writing'). The query
  runs at prerender time and is serialized into the static payload, so every
  post is present in the SSR HTML (crawlable, no-JS-friendly).

  Filter chips are PROGRESSIVE: SSR renders the full grid (All). On the client,
  the chips become interactive and filter the grid reactively — no URL routing,
  matching the reference's visual-only chips. No-JS users keep the full list.

  The outer <div> exists because Nuxt's eslint preset enforces a single template
  root on pages (the layout's <main> already provides semantics).
-->
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
// Chip label → schema category value. The schema enum is singular "Essay"; the
// reference chip label is the plural "Essays" — the only mismatch. 'All' is a
// sentinel that disables filtering.
const CHIPS: { label: string; category: string | null }[] = [
  { label: 'All', category: null },
  { label: 'Essays', category: 'Essay' },
  { label: 'Field notes', category: 'Field notes' },
  { label: 'Training', category: 'Training' },
  { label: 'Opinion', category: 'Opinion' },
  { label: 'Build log', category: 'Build log' },
]

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

// Canonical / og:url for /writing. Site base = https://claudiomendonca.com.
const canonical = 'https://claudiomendonca.com/writing'
useHead({ link: [{ rel: 'canonical', href: canonical }] })
useSeoMeta({
  title: 'Writing — Claudio Mendonça',
  description:
    'Notes on building AI systems that ship — what works, what doesn’t, and the experiments in between.',
  ogUrl: canonical,
})
</script>

<template>
  <div>
    <!-- PAGE HEADER -->
    <section class="writing-header">
      <div class="shell">
        <span class="label" data-reveal>Writing &amp; experiments</span>
        <h1 class="writing-header__title" data-reveal>The journal.</h1>
        <p class="writing-header__dek" data-reveal>
          Notes on building AI systems that ship — what works, what doesn’t, and
          the experiments in between. Written by hand; the newsletter is not.
        </p>

        <!-- Category filter chips. SSR renders all chips; JS makes them filter. -->
        <ul class="filter-chips mono" data-reveal aria-label="Filter posts by category">
          <li v-for="chip in CHIPS" :key="chip.label">
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
          <div class="post-featured__cover hatch" aria-hidden="true">
            <span class="post-featured__cover-label mono">cover — featured essay</span>
          </div>
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
        <div v-if="visibleRest.length" class="writing-grid-section__head mono" data-reveal>More posts</div>
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
