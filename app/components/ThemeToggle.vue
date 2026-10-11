<script setup lang="ts">
// Light / dark switch for the nav: a half-filled disc that flips over when the
// theme changes. The flip is driven by `data-theme` on <html> in CSS
// (chrome.css), so the icon is already right at first paint and the
// prerendered markup is identical for both themes.
const { theme, toggle } = useTheme()

// The prerendered HTML can't know the visitor's theme, so the specific label
// only appears after mount.
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const label = computed(() => {
  if (!mounted.value) return 'Switch theme'
  return `Switch to ${theme.value === 'dark' ? 'light' : 'dark'} theme`
})
</script>

<template>
  <button type="button" class="theme-toggle" :aria-label="label" @click="toggle">
    <svg class="theme-toggle__icon" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <circle cx="10" cy="10" r="8.25" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path d="M10 1.75a8.25 8.25 0 0 1 0 16.5z" fill="currentColor" />
    </svg>
  </button>
</template>
