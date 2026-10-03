<!-- Latest published writing, with one featured post and three recent links. -->
<script setup lang="ts">
import { computed } from 'vue'

// Four latest published posts. Drafts excluded. Keyed for generate-safety
// (the result ships in the prerendered payload). Distinct key from /writing.
const { data: posts } = await useAsyncData('home-writing-teaser', () =>
  queryCollection('writing')
    .where('draft', '=', false)
    .order('date', 'DESC')
    .limit(4)
    .all(),
)

// Featured = newest post; recent rows = the next three. Guarded so the teaser
// degrades cleanly on a short/empty dataset.
const featured = computed(() => posts.value?.[0] ?? null)
const recent = computed(() => (posts.value ?? []).slice(1, 4))


// The teaser is purely promotional: with no published posts there is nothing to
// feature and "All posts →" would point at an empty /writing, so the whole
// section is omitted rather than rendering an orphaned header (the /writing
// index owns the first-class empty state). Guards the section in the template.
const hasPosts = computed(() => (posts.value?.length ?? 0) > 0)
</script>

<template>
  <section v-if="hasPosts" id="writing" class="writing-teaser">
    <div class="shell">
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
