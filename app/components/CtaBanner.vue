<!--
  Prop-driven CTA banner used at the bottom of /consulting (PRO-78 U5, K5).
  Wraps its own <section> + .shell so consumers stay declarative.

  Markup lifted from _process/prototype/consulting.html lines 232–251.
  Visual rules (top+bottom border, oversized headline, mailto pill on the
  right collapsing under the headline below 800px) live in
  app/assets/css/sections.css under .cta-banner*.
-->
<script setup lang="ts">
interface Props {
  heading: string
  body: string
  ctaLabel: string
  ctaHref: string
}

defineProps<Props>()
</script>

<template>
  <section data-screen-label="Consulting — CTA">
    <div class="shell">
      <div class="cta-banner">
        <div>
          <h2>{{ heading }}</h2>
          <p>{{ body }}</p>
        </div>
        <div>
          <a class="btn btn-filled" :href="ctaHref">
            {{ ctaLabel }}
            <span class="btn-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
