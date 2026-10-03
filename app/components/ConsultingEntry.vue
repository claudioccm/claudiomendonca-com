<!-- Services offering with its scope and outcomes. Renders inside the offerings list. -->
<script setup lang="ts">
interface Props {
  title: string
  tagline: string
  blurb: string
  outcomes: string[]
}

defineProps<Props>()

</script>

<template>
  <li class="entry entry-rich">
    <div class="entry-body">
      <h3>{{ title }}</h3>
      <p class="tagline">
        {{ tagline }}
      </p>
      <p class="blurb">
        {{ blurb }}
      </p>
    </div>
    <div class="entry-body entry-body--outcomes">
      <ul class="outcomes">
        <li v-for="(o, i) in outcomes" :key="i">
          <span>{{ o }}</span>
        </li>
      </ul>
    </div>
  </li>
</template>
