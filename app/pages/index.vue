<!--
  Home one-pager (PRO-112 dark redesign). Hero = HeroSection + KineticHeading +
  MagneticButton (PRO-111); #work = ExperimentCard grid; #about = bio block.
  Card data is iterated from app/data/experiments.ts, so adding a product is one
  new array entry + one image file — no edit to this page or ExperimentCard for
  the data itself. Section ids #work / #about are load-bearing (nav, footer,
  _redirects, and the /about → #about redirect depend on them).
  The outer <div> exists because Nuxt's eslint preset enforces a single
  template root on pages (the layout's <main> already provides semantics).
-->
<script setup lang="ts">
import { ref } from 'vue'
import { experiments } from '~/data/experiments'
import { useScrollReveal } from '~/composables/useScrollReveal'

// Canonical / og:url for the homepage. Site base = https://claudiomendonca.com.
const canonical = 'https://claudiomendonca.com/'
useHead({ link: [{ rel: 'canonical', href: canonical }] })
useSeoMeta({ ogUrl: canonical })

// Scroll reveals (PRO-112) — enhancement only. The ExperimentCards self-reveal
// (each card owns its own useScrollReveal), so the page reveals just the #work
// section head and the #about bio block. useScrollReveal is a no-op on SSR /
// no-JS / reduced-motion, so the served HTML carries all copy with no hidden
// start state (R7).
const workHeadEl = ref<HTMLElement | null>(null)
const bioEl = ref<HTMLElement | null>(null)
useScrollReveal(workHeadEl)
useScrollReveal(bioEl, { childSelector: ':scope > *', stagger: 0.08 })
</script>

<template>
  <div>
    <HeroSection>
      <template #eyebrow>
        <span class="dot" aria-hidden="true" />
        <span>CLAUDIO MENDONÇA — FOUNDER.DESIGNER.ENGINEER</span>
      </template>
      <template #headline>
        <KineticHeading :words="['EXPERIMENTS', 'CONSULTING', 'TRAINING']" prefix="AI " />
      </template>
      <template #sub>
        I build opinionated AI experimental tools. Use with moderation. This page is the index.
      </template>
      <template #ctas>
        <MagneticButton variant="filled" href="#work" arrow>See the work</MagneticButton>
        <MagneticButton variant="ghost" to="/consulting">Consulting</MagneticButton>
      </template>
    </HeroSection>

    <section id="work">
      <div class="shell">
        <div ref="workHeadEl" class="section-head">
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
            <span class="label">About</span>
            <h2>About.</h2>
          </div>
          <div ref="bioEl" class="bio-body">
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
  </div>
</template>
