<!--
  Writing post — /writing/[slug] (PRO-178).

  Spec: _process/design-exploration-unzipped/Blog Post.dc.html + screenshots
  01-post.png / 02-post.png. "← Back to writing"; mono meta row
  (category / date / read-time); serif title; italic-serif dek; author byline
  with a hatch avatar ("Claudio Mendonça — Design engineer · British Columbia");
  hatch cover; then the markdown body via <ContentRenderer> — mono prose (~1.7
  line-height) with serif h2 subheads.

  The doc comes from the `writing` @nuxt/content collection by route path. The
  query runs at prerender, so each post ships fully rendered in static HTML.
  A missing slug throws a 404 (createError) so prerender + runtime both 404
  cleanly instead of rendering an empty shell.

  The outer <div> exists because Nuxt's eslint preset enforces a single template
  root on pages (the layout's <main> already provides semantics).
-->
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

// Canonical / og:url + per-post SEO. Site base = https://claudiomendonca.com.
const canonical = computed(() => `https://claudiomendonca.com${post.value.path}`)
useHead({ link: [{ rel: 'canonical', href: canonical.value }] })
useSeoMeta({
  title: () => `${post.value.title} — Claudio Mendonça`,
  description: () => post.value.dek,
  ogUrl: () => canonical.value,
  ogType: 'article',
})

// Article structured data (schema.org/Article). Emitted as an inline
// ld+json <script> in the prerendered <head> so crawlers get rich-result
// metadata (headline, author, dates, canonical url) without client JS.
// `dek` is optional in the schema; the description key is omitted when absent
// rather than shipping an empty string.
//
// The content layer normalizes `date` to a space-separated SQLite datetime
// ("2026-02-28 16:00:00"), which is NOT valid schema.org ISO-8601. Re-parse it
// to a strict ISO string so crawlers accept datePublished/dateModified; fall
// back to the raw value if parsing ever fails.
const isoDate = computed(() => {
  const d = new Date(post.value.date)
  return Number.isNaN(d.getTime()) ? post.value.date : d.toISOString()
})
const articleJsonld = computed(() => {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.value.title,
    'datePublished': isoDate.value,
    'dateModified': isoDate.value,
    'author': {
      '@type': 'Person',
      'name': 'Claudio Mendonça',
      'url': 'https://claudiomendonca.com/',
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
          <div class="article__avatar hatch" aria-hidden="true" />
          <div class="article__byline-text mono">
            <span class="article__author">Claudio Mendonça</span>
            <span class="article__role">Design engineer — British Columbia</span>
          </div>
        </div>
      </div>

      <!-- cover (hatch placeholder, matching the reference) -->
      <div class="article__cover-wrap">
        <div class="article__cover hatch" aria-hidden="true">
          <span class="article__cover-label mono">cover image</span>
        </div>
      </div>

      <!-- body -->
      <div class="article__body prose">
        <ContentRenderer :value="post" />
      </div>
    </article>
  </div>
</template>
