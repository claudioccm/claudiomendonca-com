<!--
  Slot-driven hero. The same chrome (eyebrow, clamp-disp H1, sub paragraph,
  CTA row, optional down-arrow) is reused by /consulting; encoding the content
  as slots lets each consumer write the markup it actually wants while the
  wrapper enforces layout. Styles live in sections.css. (Plan K2.)

  PRO-174: the motion stack was retired. The hero background is the static
  `.hero-bg-fallback` CSS gradient (previously the SSR / reduced-motion
  fallback behind the WebGL scene). No Three.js, no capability gate. The slot
  API (#eyebrow / #headline / #sub / #ctas + downArrow props) is unchanged —
  both index.vue and consulting.vue depend on it.

  PRO-177: added an optional #after slot, rendered after the CTA row inside the
  hero shell, for /consulting's in-hero deliverable chips. index.vue omits it.
-->
<script setup lang="ts">
interface Props {
  downArrow?: boolean
  downArrowHref?: string
}

withDefaults(defineProps<Props>(), {
  downArrow: true,
  downArrowHref: '#work',
})
</script>

<template>
  <section class="hero">
    <div class="hero-bg" aria-hidden="true">
      <div class="hero-bg-fallback" />
      <!-- Interactive dot-field, matching the home hero (PRO feedback). Decorative,
           client-built, reduced-motion-safe. Only /consulting uses HeroSection. -->
      <HeroDotField />
    </div>

    <div class="shell">
      <div class="hero-eyebrow">
        <slot name="eyebrow" />
      </div>
      <slot name="headline" />
      <p class="hero-sub">
        <slot name="sub" />
      </p>
      <div class="hero-cta-row">
        <slot name="ctas" />
      </div>
      <!-- Optional content rendered after the CTA row, inside the hero shell
           (e.g. /consulting's deliverable chips). /index does not use it, so the
           home hero is unchanged. (PRO-177) -->
      <slot name="after" />
      <a
        v-if="downArrow"
        :href="downArrowHref"
        class="down-arrow"
        aria-label="Scroll to work"
      >↓</a>
    </div>
  </section>
</template>
