<script setup lang="ts">
defineProps<{
  label: string
  clients: Array<{ name: string, src: string, width: number, height: number }>
}>()
</script>

<template>
  <div class="client-logos">
    <p class="client-logos__label">{{ label }}</p>
    <ul class="client-logos__list" aria-label="Previous clients">
      <li v-for="client in clients" :key="client.name">
        <img :src="client.src" :alt="client.name" :width="client.width" :height="client.height">
      </li>
    </ul>
  </div>
</template>
