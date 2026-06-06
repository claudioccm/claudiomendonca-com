<!--
  Home one-pager. Composition lifted from _process/prototype/index.html
  lines 34–157 with the editor web component (image-slot) replaced by
  ExperimentCard + NuxtImg. Card data iterated from app/data/experiments.ts
  so adding a fifth product is one new array entry + one image file — no
  edit to this page, ExperimentCard, HeroSection, or sections.css. (R16)
  The outer <div> exists because Nuxt's eslint preset enforces a single
  template root on pages (the layout's <main> already provides semantics).
-->
<script setup lang="ts">
import { experiments } from '~/data/experiments'

// Canonical / og:url for the homepage. Site base = https://claudiomendonca.com.
const canonical = 'https://claudiomendonca.com/'
useHead({ link: [{ rel: 'canonical', href: canonical }] })
useSeoMeta({ ogUrl: canonical })

// Live-tunable typewriter effect config. Bound to <TypewriterHeadline> and, when
// the URL carries `?tune`, to a <TypewriterTuner> dev panel. Defaults are the
// baked-in values; tweak via the panel, then tell me the numbers to make permanent.
const typer = reactive({
  typeMs: 90,
  deleteMs: 45,
  holdMs: 1600,
  betweenMs: 400,
  cursorBlinkMs: 1050,
})

// Show the tuner only when `?tune` is present. Set client-side in onMounted so
// SSR/hydration render identically (server has no URL query); the panel patches
// in after mount for that one visitor.
const showTuner = ref(false)
onMounted(() => {
  showTuner.value = new URLSearchParams(window.location.search).has('tune')
})
</script>

<template>
  <div>
    <HeroSection>
      <template #eyebrow>
        <span class="dot" aria-hidden="true" />
        <span>CLAUDIO MENDONÇA — FOUNDER.DESIGNER.ENGINEER</span>
      </template>
      <template #headline>
        <TypewriterHeadline
          :type-ms="typer.typeMs"
          :delete-ms="typer.deleteMs"
          :hold-ms="typer.holdMs"
          :between-ms="typer.betweenMs"
          :cursor-blink-ms="typer.cursorBlinkMs"
        />
      </template>
      <template #sub>
        I build opinionated AI experimental tools. Use with moderation. This page is the index.
      </template>
      <template #ctas>
        <a class="btn btn-filled" href="#work">
          See the work
          <span class="btn-arrow" aria-hidden="true">→</span>
        </a>
        <NuxtLink class="btn btn-ghost" to="/consulting">Consulting</NuxtLink>
      </template>
    </HeroSection>

    <section id="work">
      <div class="shell">
        <div class="section-head">
          <span class="label">EXPERIMENTS —</span>
        </div>
        <div class="experiments-grid" role="list" aria-label="Experiments">
          <ExperimentCard
            v-for="(item, i) in experiments"
            :key="item.id"
            :idx="i + 1"
            :title="item.title"
            :tag="item.tag"
            :href="item.url"
            :image="item.image"
            :alt="item.alt"
            :aria-label="item.ariaLabel"
          />
        </div>
      </div>
    </section>

    <section id="about">
      <div class="shell">
        <div class="bio-grid">
          <div>
            <span class="label">About</span>
            <h2>About.</h2>
          </div>
          <div class="bio-body">
            <p>
              I'm Claudio Mendonça, design engineer, working at the intersection
              of design, code, and AI.
            </p>
            <p class="secondary">
              The products on this page are the experiments I'm shipping under
              my own name. The <NuxtLink class="link-underline" to="/consulting">consulting page</NuxtLink>
              is what I do for clients: systems that produce their recurring
              documents and reports, plus training so their team works with AI
              on everything else.
            </p>
            <p class="secondary">
              Based in beautiful British Columbia. Available for a small number of engagements at a time.
            </p>
          </div>
        </div>
      </div>
    </section>

    <ClientOnly>
      <TypewriterTuner v-if="showTuner" v-model:config="typer" />
    </ClientOnly>
  </div>
</template>
