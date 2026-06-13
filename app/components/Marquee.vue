<!--
  Marquee — infinite horizontal ticker (PRO-113, U3). First used as a quiet
  role/tools strip on /consulting.

  The seamless loop is PURE CSS (no GSAP, no onMounted): the track holds TWO
  identical item groups side by side and animates translateX(0 → -50%)
  infinitely, so the second group slides exactly into where the first started —
  no visible seam. The animation, duration, and the reduced-motion pause all
  live in app/assets/css/sections.css (.marquee*); this component is purely
  structural, so it is trivially SSR-safe — every item renders as real text in
  the served HTML (PRO-109 R7).

  Accessibility: the first group is the readable list; the duplicate group is
  aria-hidden so assistive tech reads the items once. Under
  prefers-reduced-motion the CSS pauses the animation (animation: none), leaving
  the strip static and fully readable.
-->
<script setup lang="ts">
interface Props {
  /** Strings shown in the ticker (e.g. roles / tools). */
  items: string[]
  /** Accessible name for the readable list. */
  ariaLabel?: string
  /** Seconds for one full loop. Higher = slower. Defaults to 32. */
  durationSeconds?: number
}

withDefaults(defineProps<Props>(), {
  ariaLabel: undefined,
  durationSeconds: 32,
})
</script>

<template>
  <div
    class="marquee"
    :style="{ '--marquee-duration': `${durationSeconds}s` }"
  >
    <div class="marquee-track">
      <ul class="marquee-group" :aria-label="ariaLabel">
        <li v-for="(item, i) in items" :key="`a-${i}`" class="marquee-item">
          {{ item }}
        </li>
      </ul>
      <ul class="marquee-group" aria-hidden="true">
        <li v-for="(item, i) in items" :key="`b-${i}`" class="marquee-item">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>
