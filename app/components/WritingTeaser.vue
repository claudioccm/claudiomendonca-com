<!--
  Home "Writing teaser" section (PRO-180) — "Notes from the practice."

  Spec: _process/design-exploration-unzipped/Hero - Combined.dc.html (BLOG block,
  lines 245–304) + screenshots 01/02-home-blog.png. A section head (mono
  "WRITING NN / NN" meta row + serif headline + "All posts →" link), a featured
  block reusing the .post-featured* vocabulary, and ~3 recent rows
  (category | serif title | date · read-time).

  Posts come LIVE from the `writing` @nuxt/content collection via
  queryCollection('writing'), newest first, drafts excluded. The query runs at
  prerender time and is serialized into the static payload (keyed
  `home-writing-teaser`, distinct from the /writing index's `writing-index`), so
  every teaser post is present in the SSR HTML — crawlable, no-JS-friendly.

  The featured post is the NEWEST post (posts[0]), per the brief ("featured
  latest post … newest first"). This is intentionally NOT the `writing.featured`
  flag the /writing index uses (PRO-178) — on the current dataset the two
  coincide. The recent rows are the next 3 posts.

  [data-reveal] reveals are CSS-only (base.css), double-guarded for
  reduced-motion / no-JS / unsupported browsers, so the served markup is the
  complete static teaser. Styles live in app/assets/css/sections.css under the
  Writing block (.writing-teaser* / .teaser-row*), reusing .post-featured*.
-->
<script setup lang="ts">
import { computed } from 'vue'

// All published posts, newest first. Drafts excluded. Keyed for generate-safety
// (the result ships in the prerendered payload). Distinct key from /writing.
const { data: posts } = await useAsyncData('home-writing-teaser', () =>
  queryCollection('writing')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .all(),
)

// Featured = newest post; recent rows = the next three. Guarded so the teaser
// degrades cleanly on a short/empty dataset.
const featured = computed(() => posts.value?.[0] ?? null)
const recent = computed(() => (posts.value ?? []).slice(1, 4))

// Live post count for the "NN / NN" meta counter — honest, from data. Both
// halves render the SAME count (e.g. "05 / 05") BY DESIGN: this mirrors the
// reference's section meta row, where the right number is the collection size
// and the left is the section's own position; for the teaser there is one
// writing surface, so both read the post total. Not a placeholder to "fix".
const total = computed(() => posts.value?.length ?? 0)
const totalLabel = computed(() => padIndex(total.value))

// The teaser is purely promotional: with no published posts there is nothing to
// feature and "All posts →" would point at an empty /writing, so the whole
// section is omitted rather than rendering an orphaned header (the /writing
// index owns the first-class empty state). Guards the section in the template.
const hasPosts = computed(() => total.value > 0)
</script>

<template>
  <section v-if="hasPosts" id="writing" class="writing-teaser">
    <div class="shell">
      <!-- Section meta row: WRITING … NN / NN -->
      <div class="writing-teaser__meta mono" data-reveal>
        <span>Writing</span>
        <span>{{ totalLabel }} / {{ totalLabel }}</span>
      </div>

      <!-- Headline + "All posts →" -->
      <div class="writing-teaser__head">
        <h2 class="writing-teaser__title" data-reveal>Notes from the practice.</h2>
        <NuxtLink to="/writing" class="writing-teaser__all" data-reveal>
          All posts
          <span class="writing-teaser__all-arrow" aria-hidden="true">→</span>
        </NuxtLink>
      </div>

      <!-- Featured (newest) post -->
      <NuxtLink
        v-if="featured"
        :to="featured.path"
        class="post-featured"
        data-reveal
      >
        <div class="post-featured__cover hatch" aria-hidden="true">
          <span class="post-featured__cover-label mono">cover — {{ featured.category.toLowerCase() }}</span>
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
          <h3 class="post-featured__title">{{ featured.title }}</h3>
          <p v-if="featured.dek" class="post-featured__dek">{{ featured.dek }}</p>
          <span class="post-featured__cta mono">
            Read
            <span class="post-featured__arrow" aria-hidden="true">→</span>
          </span>
        </div>
      </NuxtLink>

      <!-- Recent rows -->
      <ul v-if="recent.length" class="teaser-rows" aria-label="Recent posts">
        <li v-for="post in recent" :key="post.path" data-reveal>
          <NuxtLink :to="post.path" class="teaser-row">
            <span class="teaser-row__cat mono">{{ post.category }}</span>
            <span class="teaser-row__title">{{ post.title }}</span>
            <span class="teaser-row__date mono">
              {{ formatMonthYear(post.date) }}<template v-if="post.readingTime"> · {{ post.readingTime }} min</template>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>
