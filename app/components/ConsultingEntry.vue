<!--
  Leaf row component for the /consulting offerings list. Prop-driven,
  SSR-safe, no scoped styles — all visual rules live in
  app/assets/css/sections.css (.entry, .entry.entry-rich, .entry-body,
  .entry-body--outcomes, .outcomes, .label) from PRO-78 U1.

  Contract: this component renders an <li>, so it must be used inside an
  <ol class="entry-list"> / <ul> (the page's offerings list). Rendering it
  outside a list element produces invalid HTML.

  `title` carries an embedded `<br />` from the data layer (PRO-78 K3) to
  control the display-font line break, and is therefore rendered via
  `v-html`. Source is the static module `app/data/consulting.ts`, not user
  input, so there is no XSS surface.
-->
<script setup lang="ts">
interface Props {
  idx: number
  title: string
  tagline: string
  blurb: string
  outcomes: string[]
}

const props = defineProps<Props>()

// Idx label is presentation; the data layer stores plain numbers. Same
// pattern as ExperimentCard.vue from PRO-77.
const idxLabel = computed(() => String(props.idx).padStart(2, '0'))
</script>

<template>
  <li class="entry entry-rich">
    <span class="idx">{{ idxLabel }}</span>
    <div class="entry-body">
      <!-- eslint-disable-next-line vue/no-v-html -- static repo-controlled source (PRO-78 K3) -->
      <h3 v-html="title" />
      <p class="tagline">
        {{ tagline }}
      </p>
      <p class="blurb">
        {{ blurb }}
      </p>
    </div>
    <div class="entry-body entry-body--outcomes">
      <span class="label">What you walk away with</span>
      <ul class="outcomes">
        <li v-for="o in outcomes" :key="o">
          <span>{{ o }}</span>
        </li>
      </ul>
    </div>
  </li>
</template>
