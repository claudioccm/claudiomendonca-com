<!-- Published article with metadata, byline, and prerendered Markdown content. -->
<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()

// Fetch the post whose stored path matches this route (e.g. /writing/foo).
const { data: doc } = await useAsyncData(`writing-${route.path}`, () =>
  queryCollection('writing').path(route.path).first(),
)

// 404 for unknown / draft slugs so the route doesn't render a blank page.
if (!doc.value || doc.value.draft) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

const post = computed(() => doc.value!)

// Canonical / og:url + per-post SEO. Site base = https://ccm-labs.ca.
const canonical = computed(() => `https://ccm-labs.ca${post.value.path}`)

// The frontmatter authors `date` as Z-suffixed ISO-8601, but @nuxt/content's
// SQLite layer surfaces it in the rendered payload as a space-separated
// datetime ("2026-02-28 16:00:00") — NOT valid schema.org ISO-8601. Re-parse
// whatever `post.value.date` holds into a strict ISO string so crawlers accept
// the article og: timestamps and the JSON-LD datePublished/dateModified; fall
// back to the raw value if parsing ever fails. Declared before useSeoMeta so the
// article-time getters below reference it without a use-before-define.
const isoDate = computed(() => {
  const d = new Date(post.value.date)
  return Number.isNaN(d.getTime()) ? post.value.date : d.toISOString()
})

useHead({ link: [{ rel: 'canonical', href: canonical.value }] })
useSeoMeta({
  title: () => `${post.value.title} — CCM Labs`,
  description: () => post.value.dek,
  ogTitle: () => post.value.title,
  ogDescription: () => post.value.dek,
  ogUrl: () => canonical.value,
  ogType: 'article',
  articlePublishedTime: () => isoDate.value,
  articleModifiedTime: () => isoDate.value,
  articleAuthor: ['Claudio Mendonça'],
  twitterTitle: () => post.value.title,
  twitterDescription: () => post.value.dek,
})

// Article structured data (schema.org/Article). Emitted as an inline
// ld+json <script> in the prerendered <head> so crawlers + answer engines get
// rich-result metadata (headline, author, dates, image, canonical url) without
// client JS. `dek` is optional in the schema; the description key is omitted
// when absent rather than shipping an empty string.
const articleJsonld = computed(() => {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.value.title,
    'datePublished': isoDate.value,
    'dateModified': isoDate.value,
    'image': 'https://ccm-labs.ca/og-small-business.png',
    'author': {
      '@type': 'Person',
      'name': 'Claudio Mendonça',
      'url': 'https://ccm-labs.ca/#person',
    },
    'publisher': {
      '@type': 'Person',
      'name': 'Claudio Mendonça',
    },
    'url': canonical.value,
    'mainEntityOfPage': canonical.value,
  }
  if (post.value.dek) data.description = post.value.dek
  return data
})
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(articleJsonld.value)),
    },
  ],
})
</script>

<template>
  <div>
    <article class="article">
      <div class="article__head">
        <NuxtLink to="/writing" class="article__back mono">← Back to writing</NuxtLink>

        <div class="article__meta mono">
          <span>{{ post.category }}</span>
          <span class="article__sep" aria-hidden="true">/</span>
          <span>{{ formatMonthYear(post.date, true) }}</span>
          <template v-if="post.readingTime">
            <span class="article__sep" aria-hidden="true">/</span>
            <span>{{ post.readingTime }} min read</span>
          </template>
        </div>

        <h1 class="article__title">{{ post.title }}</h1>

        <p v-if="post.dek" class="article__dek">{{ post.dek }}</p>

        <div class="article__byline">
          <div class="article__byline-text mono">
            <span class="article__author">Claudio Mendonça</span>
            <span class="article__role">Design engineer — British Columbia</span>
          </div>
        </div>
      </div>

      <!-- body -->
      <div class="article__body prose">
        <ContentRenderer :value="post" />
      </div>
    </article>
  </div>
</template>
