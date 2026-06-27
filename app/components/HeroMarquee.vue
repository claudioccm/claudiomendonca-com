<!--
  Full-width deliverables marquee for the /consulting hero (Claudio feedback
  2026-06-27: "make this a full width strip that slowly moves from right to left,
  with a single row of these tags"). Replaces the wrapped .hero-chips box.

  The track holds TWO identical sets of items; a CSS animation translates it by
  -50% (exactly one set, because each item carries its own trailing margin), so
  the loop is seamless. The second set is aria-hidden — screen readers read the
  list once. Decorative, so the whole strip is role="group" + aria-label.

  Reduced motion: the animation is disabled in sections.css under
  `prefers-reduced-motion: reduce`; the duplicate set is hidden and the items
  fall back to a static wrapped row (the pre-marquee behaviour). The animation is
  also paused on hover (a partial Pause/Stop/Hide affordance).

  Styles: app/assets/css/sections.css (.hero-marquee / .hero-marquee__*).
-->
<script setup lang="ts">
defineProps<{ items: string[] }>()
</script>

<template>
  <div class="hero-marquee" role="group" aria-label="What I deliver">
    <div class="hero-marquee__track">
      <span
        v-for="(item, i) in items"
        :key="`a-${i}`"
        class="hero-marquee__item"
      >{{ item }}</span>
      <!-- Seamless-loop duplicate; hidden from the a11y tree. -->
      <span
        v-for="(item, i) in items"
        :key="`b-${i}`"
        class="hero-marquee__item"
        aria-hidden="true"
      >{{ item }}</span>
    </div>
  </div>
</template>
