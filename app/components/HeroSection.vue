<!--
  Slot-driven hero. The same chrome (eyebrow, clamp-disp H1, sub paragraph,
  CTA row, optional down-arrow) is reused by /consulting in PRO-78; encoding
  the content as slots lets each consumer write the markup it actually wants
  while the wrapper enforces layout. Styles live in sections.css. (Plan K2.)
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
      <a
        v-if="downArrow"
        :href="downArrowHref"
        class="down-arrow"
        aria-label="Scroll to work"
      >↓</a>
    </div>
  </section>
</template>
