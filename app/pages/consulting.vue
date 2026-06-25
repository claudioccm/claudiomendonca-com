<!--
  Consulting one-pager. Composition lifted from
  _process/prototype/consulting.html lines 33–251 with section primitives
  decomposed into HeroSection (PRO-77), ConsultingEntry, HowItWorks, and
  CtaBanner (all PRO-78).

  Offering data lives in app/data/consulting.ts so adding a fourth offering
  is one new array entry — no edit to this page, ConsultingEntry,
  HowItWorks, CtaBanner, or sections.css. (PRO-78 R10, K4, AC4.)

  The outer <div> exists because Nuxt's eslint preset enforces a single
  template root on pages (the layout's <main> already provides semantics).
-->
<script setup lang="ts">
import { consultingOfferings } from '~/data/consulting'

// Canonical / og:url for /consulting. Site base = https://claudiomendonca.com.
const canonical = 'https://claudiomendonca.com/consulting'
useHead({ link: [{ rel: 'canonical', href: canonical }] })
useSeoMeta({ ogUrl: canonical })

// Role / tools strip shown under the hero. Page-owned copy — no data module,
// since it is presentational and specific to this page. PRO-174 retired the
// scrolling marquee; this now renders as a static readable list.
const tagItems = [
  'Recurring reports',
  'Newsletters',
  'Research briefs',
  'On-brand output',
  'Human-in-the-loop',
  'Team training',
  'Built in your tools',
  'Yours to keep',
]
</script>

<template>
  <div>
    <HeroSection down-arrow-href="#consulting">
      <template #eyebrow>
        <span class="dot" aria-hidden="true" />
        <span>Consulting — automated, on-brand, accountable</span>
      </template>
      <template #headline>
        <h1>Your recurring work, done by a system.</h1>
      </template>
      <template #sub>
        Every week your team rebuilds the same reports, briefs, and newsletters
        by hand. I build systems that produce that work for you, on schedule and
        on-brand. For the parts that don't repeat, I teach your team to work with
        AI so they move faster there too.
      </template>
      <template #ctas>
        <a class="btn btn-filled" href="mailto:claudioccm@gmail.com">
          <span>Start a conversation</span>
          <span class="btn-arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn-ghost" href="#how">See how it works</a>
      </template>
    </HeroSection>

    <ul class="tag-strip" aria-label="What I deliver">
      <li v-for="(item, i) in tagItems" :key="i" class="tag-strip__item">
        {{ item }}
      </li>
    </ul>

    <section data-screen-label="Consulting — Positioning">
      <div class="shell">
        <div class="bio-grid">
          <div>
            <span class="label">Who this is for</span>
            <h2>The brief.</h2>
          </div>
          <div class="bio-body">
            <p>
              Most "AI strategy" is a slide deck. This is the opposite: working
              systems that produce your recurring documents and reports, built to
              your brand, with a person accountable for what goes out the door.
            </p>
            <p class="secondary">
              I work with research nonprofits, foundations, think tanks, and
              small expert teams — the ones who publish to make their case and
              rebuild the same reports, briefs, and newsletters from scratch
              every cycle. The work is valuable. Doing it by hand, over and over,
              is not.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section data-screen-label="Consulting — DIY counter">
      <div class="shell">
        <div class="bio-grid">
          <div>
            <span class="label">The honest version</span>
            <h2>Not just a chatbot.</h2>
          </div>
          <div class="bio-body">
            <p>
              Anyone can get a draft out of a chatbot. The hard part is the
              system that runs every cycle, stays on-brand, and has someone
              accountable when it matters. That is the part you are paying for,
              and it is the part a generic chatbot won't do.
            </p>
            <figure class="stat-figure" role="figure" aria-label="95% of company AI pilots never deliver a measurable return.">
              <span class="stat-figure__value" aria-hidden="true">
                <span class="stat-figure__num">95</span><span class="stat-figure__suffix">%</span>
              </span>
              <figcaption class="stat-figure__caption">
                <span class="stat-figure__label">of company AI pilots never deliver a measurable return.</span>
                <p class="stat-figure__note">
                  The ones run with an outside specialist succeed about twice as
                  often as in-house builds.
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
        <div class="section-head">
          <span class="label">Offerings — 03</span>
          <h2>What I do.</h2>
        </div>
        <ol class="entry-list" aria-label="Consulting offerings">
          <ConsultingEntry
            v-for="(offering, i) in consultingOfferings"
            :key="offering.id"
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

    <section data-screen-label="Consulting — Pricing">
      <div class="shell">
        <div class="section-head">
          <span class="label">What it costs</span>
          <h2>No mystery pricing.</h2>
        </div>
        <p class="price-lead">
          Transparent and fixed. You know the number before we start.
        </p>
        <dl class="price-list">
          <div class="price-row">
            <dt>Opportunity Audit</dt>
            <dd>
              <span class="price">9999,00</span>
              <span class="price-note">2–3 weeks · credited toward your build</span>
            </dd>
          </div>
          <div class="price-row">
            <dt>Build <span class="price-tag">automate</span></dt>
            <dd>
              <span class="price">from 9999,00</span>
              <span class="price-note">fixed, set against the value it creates</span>
            </dd>
          </div>
          <div class="price-row">
            <dt>Empower <span class="price-tag">training + setup</span></dt>
            <dd>
              <span class="price">9999,00</span>
            </dd>
          </div>
          <div class="price-row">
            <dt>Care &amp; R&amp;D</dt>
            <dd>
              <span class="price">9999,00 / month</span>
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- #contact anchor wraps the CTA banner (mailto lives here). Wrapping at
         the page level keeps the CtaBanner prop contract untouched (PRO-113 R3). -->
    <div id="contact">
      <CtaBanner
        heading="Got something to build?"
        body="A short note about what you're working on is enough to start. No deck required."
        cta-label="Start a conversation"
        cta-href="mailto:claudioccm@gmail.com"
      />
    </div>
  </div>
</template>
