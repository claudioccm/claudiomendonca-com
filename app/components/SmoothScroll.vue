<!--
  SmoothScroll — layout-level provider seam for the motion platform (PRO-109, R10).

  The Lenis instance itself is created in `app/plugins/lenis.client.ts` (client
  only, gated off on reduced-motion / touch). This component is the documented
  mount point that later cycles hook into — it renders its default slot directly
  so page content is present in SSR and no-JS output (R13). It deliberately holds
  no library imports, keeping it SSR-safe and zero-cost when motion is disabled.

  It exposes the provided Lenis instance (or null when gated) to slotted content
  via the `lenis` slot prop, so later-cycle components can call e.g.
  `lenis?.scrollTo(target)` without reaching into the Nuxt app directly.
-->
<script setup lang="ts">
const { $lenis } = useNuxtApp()
</script>

<template>
  <div class="smooth-scroll">
    <slot :lenis="$lenis" />
  </div>
</template>

<style scoped>
.smooth-scroll {
  display: contents;
}
</style>
