<!--
  Numbered section index bar (editorial redesign). The repeated rule across the
  home upper sections: a top hairline, an uppercase mono label on the left, and
  the section's position "NN / 05" on the right. Mirrors the prototype's section
  meta row (_process/design-exploration-unzipped/Hero - Combined.dc.html).

  Carries `data-reveal` so it fades in on scroll via the CSS-only [data-reveal]
  utility (base.css), double-guarded for reduced-motion / no-JS. Styles live in
  app/assets/css/sections.css under `.section-index`.
-->
<script setup lang="ts">
defineProps<{
  /** Left-hand label, e.g. "Work". Rendered uppercase via CSS. */
  label: string
  /** Right-hand position string, e.g. "02 / 05". */
  index: string
}>()
</script>

<template>
  <div class="section-index" data-reveal>
    <span class="section-index__label">{{ label }}</span>
    <span class="section-index__num">{{ index }}</span>
  </div>
</template>
