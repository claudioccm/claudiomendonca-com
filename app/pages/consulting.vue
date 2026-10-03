<!-- Small-business services, scope, process, and contact form. Copy comes from content/site.json. -->
<script setup lang="ts">
// All /consulting copy is sourced from the `site` content collection
// (content/site.json) — the single source of truth (PRO-176).
const { data: site } = await useSiteContent()
const consulting = computed(() => site.value?.consulting)
const consultingOfferings = computed(() => consulting.value?.offerings.items ?? [])
// Both heroes share the client logos from the content collection.
const trustedBy = computed(() => site.value?.identity.trustedBy)

// Canonical / og:url + per-page SEO. Site base = https://claudiomendonca.com.
const canonical = 'https://claudiomendonca.com/consulting'
useHead({ link: [{ rel: 'canonical', href: canonical }] })
useSeoMeta({
  title: 'Small Business Services — Claudio Mendonça',
  description: () => consulting.value?.subhead,
  ogTitle: 'Small Business Services — Claudio Mendonça',
  ogDescription: () => consulting.value?.subhead,
  ogUrl: canonical,
  twitterTitle: 'Small Business Services — Claudio Mendonça',
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
      'name': o.title,
      'description': o.tagline,
    },
  }))
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    'name': 'Claudio Mendonça — Small business software and AI',
    'url': canonical,
    'description': c?.subhead,
    'serviceType': ['Custom software', 'Business automation', 'Data integration', 'AI training'],
    'areaServed': ['Squamish', 'Whistler', 'Pemberton', 'Sea-to-Sky corridor'],
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
    <HeroSection>
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
      <template #after>
        <ClientLogos v-if="trustedBy" :label="trustedBy.label" :clients="trustedBy.clients" />
      </template>
    </HeroSection>

    <section id="consulting" data-screen-label="Consulting — List">
      <div class="shell">
        <div class="section-head" data-reveal>
          <h2>{{ consulting?.offerings.heading }}</h2>
        </div>
        <ol class="entry-list" aria-label="Consulting offerings">
          <ConsultingEntry
            v-for="offering in consultingOfferings"
            :id="offering.id"
            :key="offering.id"
            data-reveal
            :title="offering.title"
            :tagline="offering.tagline"
            :blurb="offering.blurb"
            :outcomes="offering.outcomes"
          />
        </ol>
      </div>
    </section>

    <HowItWorks />

    <section data-screen-label="Consulting — Positioning">
      <div class="shell">
        <div class="bio-grid">
          <div data-reveal>
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

    <section data-screen-label="Services — Software and AI">
      <div class="shell">
        <div class="bio-grid">
          <div data-reveal>
            <h2>{{ consulting?.differentiator.heading }}</h2>
          </div>
          <div class="bio-body" data-reveal>
            <p>
              {{ consulting?.differentiator.paragraphs[0] }}
            </p>
            <p class="secondary">
              {{ consulting?.differentiator.paragraphs[1] }}
            </p>
            <figure class="stat-figure">
              <figcaption class="stat-figure__caption">
                <span class="stat-figure__label">{{ consulting?.differentiator.startingPoint.label }}</span>
                <p class="stat-figure__note">
                  {{ consulting?.differentiator.startingPoint.note }}
                </p>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>

    <!-- #contact: the consulting CTA copy + a working contact form (Netlify
         Forms, ContactForm.vue). The hero "Start a conversation" CTA scrolls
         here. Replaced the old mailto-only CtaBanner (Claudio feedback
         2026-06-27). -->
    <section id="contact" class="contact-section" data-screen-label="Consulting — Contact">
      <div class="shell">
        <div class="contact-grid">
          <div class="contact-intro" data-reveal>
            <h2 class="contact-intro__title">{{ consulting?.cta.heading }}</h2>
            <p class="contact-intro__body">{{ consulting?.cta.body }}</p>
            <a
              v-if="consulting?.cta.target"
              class="contact-intro__mail mono"
              :href="consulting.cta.target"
            >or email me directly →</a>
          </div>
          <div data-reveal>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
