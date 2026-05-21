<script setup>
// Sticky primary navigation. Owns the scroll listener that toggles the
// .is-scrolled class on the root <header> when window.scrollY > 0.
// Route-aware hrefs flip in-page anchors to cross-route anchors when the
// user is on /consulting — see plan K4.
const route = useRoute()
const isScrolled = ref(false)

const isConsulting = computed(() => route.path === '/consulting')

// Each link: { label, href, routeMatch, hideSm? }. routeMatch is the path
// that should paint aria-current="page" on this link; null = never active.
const links = computed(() => [
  { label: 'Experiments', href: isConsulting.value ? '/#work' : '#work', routeMatch: '/' },
  { label: 'Consulting', href: '/consulting', routeMatch: '/consulting' },
  // About points to an in-page anchor on home, not its own route, so it
  // never carries aria-current — only Experiments lights up on /.
  { label: 'About', href: isConsulting.value ? '/#about' : '#about', routeMatch: null, hideSm: true },
  { label: 'Contact', href: '#contact', routeMatch: null },
])

// Scroll listener — SSR-safe: registered in onMounted (client-only), torn
// down in onBeforeUnmount. Mirrors the prototype IIFE at
// _process/prototype/index.html lines 209–221, Vue-ified.
let handleScroll = null

onMounted(() => {
  handleScroll = () => {
    isScrolled.value = window.scrollY > 0
  }
  // Set initial state in case the page loads already scrolled (e.g. anchor jump).
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (handleScroll) {
    window.removeEventListener('scroll', handleScroll)
    handleScroll = null
  }
})
</script>

<template>
  <header id="top" class="nav" :class="{ 'is-scrolled': isScrolled }">
    <div class="shell nav-inner">
      <NuxtLink to="/" class="wordmark" aria-label="Claudio Mendonça — home" :aria-current-value="false">
        <span class="ast" aria-hidden="true">✱</span>
        <span>Claudio Mendonça</span>
      </NuxtLink>
      <nav aria-label="Primary">
        <ul class="nav-links">
          <li v-for="link in links" :key="link.label">
            <a
              :href="link.href"
              :class="{ 'hide-sm': link.hideSm }"
              :aria-current="link.routeMatch && route.path === link.routeMatch ? 'page' : undefined"
            >{{ link.label }}</a>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
