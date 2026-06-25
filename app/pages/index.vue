<!--
  Home one-pager (PRO-112 dark redesign; expanded composition PRO-180).
  Hero = HeroSection (static CSS gradient backdrop, static <h1> + plain .btn
  CTAs — PRO-174); #work = ExperimentCard grid; #about = bio block; then the
  Writing teaser (<WritingTeaser>, #writing) and the newsletter band
  (<NewsletterBand>, #newsletter).
  Copy + card data are sourced from the `site` content collection
  (content/site.json) via useSiteContent (PRO-176), so adding a product is one
  new entry in experiments.items + one image file — no edit to this page or
  ExperimentCard for the data itself. The Writing teaser pulls live from the
  `writing` collection inside <WritingTeaser> (PRO-180). Section ids #work /
  #about are load-bearing (nav, footer, _redirects, and the /about → #about
  redirect depend on them).
  The outer <div> exists because Nuxt's eslint preset enforces a single
  template root on pages (the layout's <main> already provides semantics).
-->
<script setup lang="ts">
// All home-page copy is sourced from the `site` content collection
// (content/site.json) — the single source of truth (PRO-176).
const { data: site } = await useSiteContent()
const intro = computed(() => site.value?.intro)
const about = computed(() => site.value?.about)
const experiments = computed(() => site.value?.experiments.items ?? [])

// Canonical / og:url for the homepage. Site base = https://claudiomendonca.com.
const canonical = 'https://claudiomendonca.com/'
useHead({ link: [{ rel: 'canonical', href: canonical }] })
useSeoMeta({ ogUrl: canonical })

// Scroll reveals are CSS-only (PRO-174): the #work section head and #about bio
// block carry `data-reveal`, revealed by the [data-reveal] rule in base.css via
// a scroll-linked View Timeline. The rule is guarded by `@supports` +
// `prefers-reduced-motion: no-preference`, so SSR / no-JS / reduced-motion /
// unsupported browsers render the complete static copy with no hidden start
// state (R7).
</script>

<template>
  <div>
    <HeroSection>
      <template #eyebrow>
        <span class="dot" aria-hidden="true" />
        <span>{{ intro?.eyebrow }}</span>
      </template>
      <template #headline>
        <h1>{{ intro?.headline }}</h1>
      </template>
      <template #sub>
        {{ intro?.subhead }}
      </template>
      <template #ctas>
        <a class="btn btn-filled" :href="intro?.ctas[0]?.target">
          <span>{{ intro?.ctas[0]?.label }}</span>
          <span class="btn-arrow" aria-hidden="true">→</span>
        </a>
        <NuxtLink class="btn btn-ghost" :to="intro?.ctas[1]?.target">{{ intro?.ctas[1]?.label }}</NuxtLink>
      </template>
    </HeroSection>

    <section id="work">
      <div class="shell">
        <div class="section-head" data-reveal>
          <span class="label">EXPERIMENTS —</span>
        </div>
        <ul class="experiments-grid" aria-label="Experiments">
          <li
            v-for="(item, i) in experiments"
            :key="item.id"
          >
            <ExperimentCard
              :idx="i + 1"
              :title="item.title"
              :tag="item.tag"
              :href="item.url"
              :image="item.image"
              :alt="item.alt"
              :aria-label="item.ariaLabel"
            />
          </li>
        </ul>
      </div>
    </section>

    <section id="about">
      <div class="shell">
        <div class="bio-grid">
          <div>
            <span class="label">{{ about?.label }}</span>
            <h2>{{ about?.heading }}</h2>
          </div>
          <div class="bio-body" data-reveal>
            <p>
              {{ about?.intro }}
            </p>
            <p class="secondary">
              {{ about?.practice.before
              }}<NuxtLink class="link-underline" :to="about?.practice.linkTarget">{{ about?.practice.linkLabel }}</NuxtLink>{{ about?.practice.after }}
            </p>
            <p class="secondary">
              {{ about?.availability }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Writing teaser — "Notes from the workshop." Live `writing` collection
         (featured = newest + 3 recent rows + "All posts →"). PRO-180. -->
    <WritingTeaser />

    <!-- Newsletter band — functional Resend-backed signup (PRO-179). Adds
         #newsletter; same band rendered on /writing. -->
    <NewsletterBand />
  </div>
</template>
