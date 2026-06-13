<!--
  Slot-driven hero. The same chrome (eyebrow, clamp-disp H1, sub paragraph,
  CTA row, optional down-arrow) is reused by /consulting in PRO-78; encoding
  the content as slots lets each consumer write the markup it actually wants
  while the wrapper enforces layout. Styles live in sections.css. (Plan K2.)

  PRO-111: a background layer is added BEHIND the slots. When useWebGLCapable()
  is true a client-only Three.js shader plane (HeroScene) mounts; otherwise an
  animated CSS gradient fallback shows (static under prefers-reduced-motion).
  The slot API (#eyebrow / #headline / #sub / #ctas + downArrow props) is
  unchanged — both index.vue and consulting.vue depend on it.
-->
<script setup lang="ts">
import { ref } from 'vue'
import { useWebGLCapable } from '~/composables/useWebGLCapable'

interface Props {
  downArrow?: boolean
  downArrowHref?: string
}

withDefaults(defineProps<Props>(), {
  downArrow: true,
  downArrowHref: '#work',
})

// false on SSR / reduced-motion / small viewport / weak device — folds in
// useReducedMotion, so reduced-motion users always get the static CSS fallback.
const webglCapable = useWebGLCapable()
// If the WebGL context fails to create on a "capable" device, fall back to CSS.
const sceneFailed = ref(false)
</script>

<template>
  <section class="hero">
    <div class="hero-bg" aria-hidden="true">
      <!-- SSR / no-JS / pre-hydration: the animated CSS gradient (the #fallback
           slot). After mount the client swaps to the WebGL scene when capable,
           else keeps the gradient. Keeping the gradient inside the default slot
           too means there's a single consistent render path (no hydration
           mismatch from gating on a client-only capability check). -->
      <ClientOnly>
        <HeroScene v-if="webglCapable && !sceneFailed" @fail="sceneFailed = true" />
        <div v-else class="hero-bg-fallback" />
        <template #fallback>
          <div class="hero-bg-fallback" />
        </template>
      </ClientOnly>
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
      <a
        v-if="downArrow"
        :href="downArrowHref"
        class="down-arrow"
        aria-label="Scroll to work"
      >↓</a>
    </div>
  </section>
</template>
