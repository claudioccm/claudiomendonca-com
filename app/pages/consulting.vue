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
</script>

<template>
  <div>
    <HeroSection down-arrow-href="#consulting">
      <template #eyebrow>
        <span class="dot" aria-hidden="true" />
        <span>Consulting — Independent practice</span>
      </template>
      <template #headline>
        <h1>Ship AI that<br>actually works.</h1>
      </template>
      <template #sub>
        For builders and teams who want real agentic systems — not AI
        theatre. Architecture, automation, and training, run hands-on.
        <span class="todo">TODO(claudio): confirm hero line</span>
      </template>
      <template #ctas>
        <a class="btn btn-filled" href="mailto:claudioccm@gmail.com">
          Start a conversation
          <span class="btn-arrow" aria-hidden="true">→</span>
        </a>
        <a class="btn btn-ghost" href="#consulting">See offerings</a>
      </template>
    </HeroSection>

    <section data-screen-label="Consulting — Positioning">
      <div class="shell">
        <div class="bio-grid">
          <div>
            <span class="label">Who this is for</span>
            <h2>The brief.</h2>
          </div>
          <div class="bio-body">
            <p>
              Most "AI strategy" is a slide deck. This is the opposite:
              architecture, automation, and training delivered as working
              systems your team can run after I leave.
              <span class="todo">TODO(claudio): confirm positioning</span>
            </p>
            <p class="secondary">
              I work with small teams of builders — founders, product leads, and
              engineers — who already know what they want, but want a faster,
              cleaner path to a real agentic system in production.
            </p>
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
        <p class="t-caption faint" style="margin-top: 48px;">
          <span class="todo">TODO(claudio):</span>
          Decide whether to add <em>AI Strategy &amp; Advisory</em>,
          <em>Custom AI Product Development</em>, and
          <em>Exploration / Prototype Sprints</em> — kept off the page for v1.
        </p>
      </div>
    </section>

    <HowItWorks />

    <CtaBanner
      heading="Got something to build?"
      body="A short note about what you're working on is enough to start. No deck required."
      cta-label="Start a conversation"
      cta-href="mailto:claudioccm@gmail.com"
    />
  </div>
</template>
