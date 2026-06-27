<!--
  Home one-pager (editorial redesign).

  Rebuilt to match the prototype's combined hero page
  (_process/design-exploration-unzipped/Hero - Combined.dc.html). The upper
  sections are the focus:
    - <HomeHero>     — full-viewport hero with the interactive dot-field +
                       cycling typewriter (the page's signature, ported 1:1 from
                       the prototype). NOT the shared HeroSection (that stays for
                       /consulting).
    - #work          — <SectionIndex> "02 / 05" + "Shipping under my own name." +
                       a list of <ExperimentRow> index rows (typographic, NOT the
                       old image cards).
    - #about         — <SectionIndex> "03 / 05" + the two-column bio block.
  Then the live Writing teaser (<WritingTeaser>, #writing → "05 / 05") and the
  newsletter band (<NewsletterBand>, #newsletter).

  All copy + card data come from the `site` content collection
  (content/site.json) via useSiteContent (PRO-176). Section ids #work / #about
  are load-bearing (nav, footer, _redirects, /about → #about redirect).

  The outer <div> is the single template root the eslint preset requires. The
  upper sections are gated on `site` so the typed component props are non-null;
  `site` is prerendered, so it is always present in the static build.
-->
<script setup lang="ts">
// Home-page copy is sourced from the `site` content collection
// (content/site.json) — the single source of truth (PRO-176).
const { data: site } = await useSiteContent()

// Canonical / og:url + per-page SEO. Site base = https://claudiomendonca.com.
const SITE_URL = 'https://claudiomendonca.com'
const canonical = `${SITE_URL}/`
const homeDescription
  = 'AI experiments shipped under my own name, and a small consulting practice that turns recurring documents and reports into accountable, on-brand systems. Claudio Mendonça — design engineer.'
useHead({ link: [{ rel: 'canonical', href: canonical }] })
useSeoMeta({
  title: 'Claudio Mendonça — AI Experiments',
  description: homeDescription,
  ogTitle: 'Claudio Mendonça — AI Experiments',
  ogDescription: homeDescription,
  ogUrl: canonical,
  twitterTitle: 'Claudio Mendonça — AI Experiments',
  twitterDescription: homeDescription,
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
        'description': 'Design engineer working at the intersection of design, code, and AI.',
        'email': id?.email ? `mailto:${id.email}` : undefined,
        'address': id?.location
          ? { '@type': 'PostalAddress', 'addressRegion': id.location }
          : undefined,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        'url': canonical,
        'name': site.value?.meta.siteName ?? 'Claudio Mendonça',
        'description': site.value?.meta.description,
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

// Scroll reveals are CSS-only: [data-reveal] elements (section index bars,
// experiment rows, the bio block) are revealed by the [data-reveal] rule in
// base.css via a scroll-linked View Timeline, double-guarded by `@supports` +
// `prefers-reduced-motion: no-preference`. The hero's dot-field + typewriter are
// the only JS motion, wired client-side inside HomeHero and reduced-motion-safe.
</script>

<template>
  <div>
    <template v-if="site">
      <HomeHero
        :eyebrow="site.intro.eyebrow"
        :headline="site.intro.headline"
        :words="site.intro.typewriter ?? []"
        :subhead="site.intro.subhead"
        :ctas="site.intro.ctas"
      />

      <section id="work">
        <div class="shell">
          <SectionIndex label="Experiments" index="02 / 05" />
          <h2 class="experiments-title" data-reveal>{{ site.experiments.heading }}</h2>
          <div class="experiment-index">
            <ExperimentRow
              v-for="(item, i) in site.experiments.items"
              :key="item.id"
              :idx="i + 1"
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
          <SectionIndex :label="site.about.label" index="03 / 05" />
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

    <!-- Writing teaser — "Notes from the workshop." Live `writing` collection
         (featured = newest + 3 recent rows + "All posts →"). Renders "05 / 05". -->
    <WritingTeaser />

    <!-- Newsletter band — functional Resend-backed signup (PRO-179). Adds
         #newsletter; same band rendered on /writing. -->
    <NewsletterBand />
  </div>
</template>
