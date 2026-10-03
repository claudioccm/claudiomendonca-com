<!-- Home page. Copy comes from content/site.json; section ids support navigation and redirects. -->
<script setup lang="ts">
import { meta as siteMeta } from '../../content/site.json'
// Home-page copy is sourced from the `site` content collection
// (content/site.json) — the single source of truth (PRO-176).
const { data: site } = await useSiteContent()

// Canonical / og:url + per-page SEO. Site base = https://claudiomendonca.com.
const SITE_URL = 'https://claudiomendonca.com'
const canonical = `${SITE_URL}/`
useHead({ link: [{ rel: 'canonical', href: canonical }] })
useSeoMeta({
  title: siteMeta.title,
  description: siteMeta.description,
  ogTitle: siteMeta.title,
  ogDescription: siteMeta.description,
  ogUrl: canonical,
  twitterTitle: siteMeta.title,
  twitterDescription: siteMeta.description,
})

// Structured data (schema.org) for SEO + GEO. A Person entity (who this is,
// with sameAs links so answer engines can disambiguate the entity) plus a
// WebSite entity, linked via @id. Emitted as inline ld+json in the prerendered
// <head> — no client JS. JSON.stringify drops the undefined keys cleanly.
const structuredData = computed(() => {
  const id = site.value?.identity
  const sameAs = [...(id?.social ?? []), ...(id?.elsewhere ?? [])]
    .map(s => s.url)
    .filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        'name': id?.name ?? 'Claudio Mendonça',
        'url': canonical,
        'jobTitle': id?.title ?? 'Design engineer',
        'description': site.value?.about.intro,
        'email': id?.email ? `mailto:${id.email}` : undefined,
        'address': id?.location
          ? { '@type': 'PostalAddress', 'addressLocality': 'Squamish', 'addressRegion': 'British Columbia', 'addressCountry': 'CA' }
          : undefined,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        'url': canonical,
        'name': siteMeta.siteName,
        'description': siteMeta.description,
        'inLanguage': 'en',
        'publisher': { '@id': `${SITE_URL}/#person` },
      },
    ],
  }
})
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(structuredData.value)),
    },
  ],
})

// Scroll reveals are CSS-only: [data-reveal] elements (work rows and the bio block) are revealed by the [data-reveal] rule in
// base.css via a scroll-linked View Timeline, double-guarded by `@supports` +
// `prefers-reduced-motion: no-preference`. The hero's dot-field + typewriter are
// the only JS motion, wired client-side inside HomeHero and reduced-motion-safe.
</script>

<template>
  <div>
    <template v-if="site">
      <HomeHero
        :headline="site.intro.headline"
        :words="site.intro.typewriter ?? []"
        :subhead="site.intro.subhead"
        :ctas="site.intro.ctas"
      >
        <ClientLogos
          v-if="site.identity.trustedBy"
          :label="site.identity.trustedBy.label"
          :clients="site.identity.trustedBy.clients"
        />
      </HomeHero>

      <section id="problems">
        <div class="shell">
          <h2 class="experiments-title" data-reveal>{{ site.problems.heading }}</h2>
          <p class="section-intro mono" data-reveal>{{ site.problems.intro }}</p>
          <div class="experiment-index">
            <div v-for="problem in site.problems.items" :key="problem.title" class="experiment-row problem-row" data-reveal>
              <h3 class="experiment-row__title">{{ problem.title }}</h3>
              <p class="experiment-row__desc mono">{{ problem.description }}</p>
            </div>
          </div>
          <div class="section-trail" data-reveal>
            <NuxtLink class="btn btn-filled" :to="site.problems.cta.target">
              {{ site.problems.cta.label }} <span aria-hidden="true">→</span>
            </NuxtLink>
          </div>
        </div>
      </section>

      <section id="work">
        <div class="shell">
          <h2 class="experiments-title" data-reveal>{{ site.work.heading }}</h2>
          <div class="experiment-index">
            <ExperimentRow
              v-for="item in site.work.items"
              :key="item.id"
              :title="item.title"
              :description="item.description ?? item.tag"
              :href="item.url"
              :aria-label="item.ariaLabel"
            />
          </div>
        </div>
      </section>

      <section id="about">
        <div class="shell">
          <div class="bio-grid">
            <h2 data-reveal>{{ site.about.heading }}</h2>
            <div class="bio-body" data-reveal>
              <p>{{ site.about.intro }}</p>
              <p class="secondary">
                {{ site.about.practice.before
                }}<NuxtLink class="link-underline" :to="site.about.practice.linkTarget">{{ site.about.practice.linkLabel }}</NuxtLink>{{ site.about.practice.after }}
              </p>

            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- Latest published writing. -->
    <WritingTeaser />

    <!-- Newsletter band — functional Resend-backed signup (PRO-179). Adds
         #newsletter; same band rendered on /writing. -->
    <NewsletterBand />
  </div>
</template>
