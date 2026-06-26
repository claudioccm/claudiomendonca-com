<!--
  Consulting one-pager. Composition lifted from
  _process/prototype/consulting.html lines 33–251 with section primitives
  decomposed into HeroSection (PRO-77), ConsultingEntry, HowItWorks, and
  CtaBanner (all PRO-78).

  Copy + offering data are sourced from the `site` content collection
  (content/site.json → consulting) via useSiteContent (PRO-176), so adding a
  fourth offering is one new entry in consulting.offerings.items — no edit to
  this page, ConsultingEntry, HowItWorks, CtaBanner, or sections.css.
  (PRO-78 R10, K4, AC4; PRO-176.)

  PRO-177 (editorial reskin pass): the deliverables now render as a wrap of
  bordered mono chips INSIDE the hero (HeroSection #after slot, .hero-chips),
  per Consulting.dc.html, replacing the old full-width .tag-strip band. Section
  blocks carry [data-reveal] for the PRO-174 CSS scroll-reveal (pure-CSS,
  reduced-motion / no-JS safe). The pill CTA buttons + hero down-arrow are kept
  as shipped shared chrome (PRO-174); the deck's rectangular buttons / no-arrow
  are not adopted to avoid a cross-page theme change.

  The outer <div> exists because Nuxt's eslint preset enforces a single
  template root on pages (the layout's <main> already provides semantics).
-->
<script setup lang="ts">
// All /consulting copy is sourced from the `site` content collection
// (content/site.json) — the single source of truth (PRO-176).
const { data: site } = await useSiteContent()
const consulting = computed(() => site.value?.consulting)
const consultingOfferings = computed(() => consulting.value?.offerings.items ?? [])
const tagItems = computed(() => consulting.value?.deliverables ?? [])

// Offerings section label keeps the prototype's "Offerings — NN" form, with the
// count zero-padded and derived from the offerings list so it stays in sync.
const offeringsLabel = computed(() =>
  `${consulting.value?.offerings.label ?? ''} — ${padIndex(consultingOfferings.value.length)}`,
)

// Canonical / og:url + per-page SEO. Site base = https://claudiomendonca.com.
const canonical = 'https://claudiomendonca.com/consulting'
useHead({ link: [{ rel: 'canonical', href: canonical }] })
useSeoMeta({
  title: 'Consulting — Claudio Mendonça',
  description: () => consulting.value?.subhead,
  ogTitle: 'Consulting — Claudio Mendonça',
  ogDescription: () => consulting.value?.subhead,
  ogUrl: canonical,
  twitterTitle: 'Consulting — Claudio Mendonça',
  twitterDescription: () => consulting.value?.subhead,
})

// Structured data (schema.org/ProfessionalService) for SEO + GEO: what the
// service is, who provides it, and the offerings as an OfferCatalog so answer
// engines can surface the concrete services. Inline ld+json, no client JS.
const serviceJsonld = computed(() => {
  const c = consulting.value
  const offers = (c?.offerings.items ?? []).map(o => ({
    '@type': 'Offer',
    'itemOffered': {
      '@type': 'Service',
      'name': o.title.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim(),
      'description': o.tagline,
    },
  }))
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    'name': 'Claudio Mendonça — AI systems consulting',
    'url': canonical,
    'description': c?.subhead,
    'serviceType': 'AI automation and team training consulting',
    'areaServed': 'Worldwide',
    'provider': {
      '@type': 'Person',
      'name': 'Claudio Mendonça',
      'url': 'https://claudiomendonca.com/#person',
    },
    ...(offers.length
      ? { hasOfferCatalog: { '@type': 'OfferCatalog', 'name': 'What I do', 'itemListElement': offers } }
      : {}),
  }
})
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(serviceJsonld.value)),
    },
  ],
})
</script>

<template>
  <div>
    <HeroSection down-arrow-href="#consulting">
      <template #eyebrow>
        <span class="dot" aria-hidden="true" />
        <span>{{ consulting?.eyebrow }}</span>
      </template>
      <template #headline>
        <h1>{{ consulting?.headline }}</h1>
      </template>
      <template #sub>
        {{ consulting?.subhead }}
      </template>
      <template #ctas>
        <a class="btn btn-filled" :href="consulting?.ctas[0]?.target">
          <span>{{ consulting?.ctas[0]?.label }}</span>
          <span class="btn-arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn-ghost" :href="consulting?.ctas[1]?.target">{{ consulting?.ctas[1]?.label }}</a>
      </template>
      <!-- Deliverables as a wrap of bordered mono chips inside the hero, per the
           editorial reference (PRO-177). Replaces the old full-width .tag-strip
           band; data still comes from consulting.deliverables. -->
      <template #after>
        <ul class="hero-chips" aria-label="What I deliver">
          <li v-for="(item, i) in tagItems" :key="i" class="hero-chips__item">
            {{ item }}
          </li>
        </ul>
      </template>
    </HeroSection>

    <section data-screen-label="Consulting — Positioning">
      <div class="shell">
        <div class="bio-grid">
          <div data-reveal>
            <span class="label">{{ consulting?.brief.label }}</span>
            <h2>{{ consulting?.brief.heading }}</h2>
          </div>
          <div class="bio-body" data-reveal>
            <p>
              {{ consulting?.brief.paragraphs[0] }}
            </p>
            <p class="secondary">
              {{ consulting?.brief.paragraphs[1] }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section data-screen-label="Consulting — DIY counter">
      <div class="shell">
        <div class="bio-grid">
          <div data-reveal>
            <span class="label">{{ consulting?.differentiator.label }}</span>
            <h2>{{ consulting?.differentiator.heading }}</h2>
          </div>
          <div class="bio-body" data-reveal>
            <p>
              {{ consulting?.differentiator.paragraphs[0] }}
            </p>
            <figure class="stat-figure" role="figure" :aria-label="`${consulting?.differentiator.stat.value} ${consulting?.differentiator.stat.label}`">
              <span class="stat-figure__value" aria-hidden="true">
                <span class="stat-figure__num">95</span><span class="stat-figure__suffix">%</span>
              </span>
              <figcaption class="stat-figure__caption">
                <span class="stat-figure__label">{{ consulting?.differentiator.stat.label }}</span>
                <p class="stat-figure__note">
                  {{ consulting?.differentiator.stat.note }}
                </p>
                <cite>— MIT, <em>State of AI in Business 2025</em></cite>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>

    <section id="consulting" data-screen-label="Consulting — List">
      <div class="shell">
        <div class="section-head" data-reveal>
          <span class="label">{{ offeringsLabel }}</span>
          <h2>{{ consulting?.offerings.heading }}</h2>
        </div>
        <ol class="entry-list" aria-label="Consulting offerings">
          <ConsultingEntry
            v-for="(offering, i) in consultingOfferings"
            :key="offering.id"
            data-reveal
            :idx="i + 1"
            :title="offering.title"
            :tagline="offering.tagline"
            :blurb="offering.blurb"
            :outcomes="offering.outcomes"
          />
        </ol>
      </div>
    </section>

    <HowItWorks />

    <!-- Pricing section removed (Claudio feedback 2026-06-26) — the figures were
         9999,00 placeholders. The `consulting.pricing` data stays in site.json so
         the section can be reinstated once real numbers exist. -->

    <!-- #contact anchor wraps the CTA banner (mailto lives here). Wrapping at
         the page level keeps the CtaBanner prop contract untouched (PRO-113 R3). -->
    <div id="contact">
      <CtaBanner
        :heading="consulting?.cta.heading ?? ''"
        :body="consulting?.cta.body ?? ''"
        :cta-label="consulting?.cta.label ?? ''"
        :cta-href="consulting?.cta.target ?? ''"
      />
    </div>
  </div>
</template>
