<script setup lang="ts">
// Sticky primary navigation (dark restyle — PRO-110).
//
// Preserves the PRO-76/PRO-79 contract verbatim in behavior:
//   - route-aware `links` computed (in-page anchors on /, cross-route on /consulting)
//   - aria-current="page" painting on the active route
//   - the scroll listener that toggles .is-scrolled on the root <header>
//
// PRO-110 layers a mobile full-screen overlay menu on top: a hamburger toggle
// (visible below the overlay breakpoint), a hand-rolled focus trap,
// Esc-to-close, body scroll lock, and focus restoration to the trigger on
// close. Tap targets are >=44px.
//
// PRO-174 retired the motion stack: the overlay open/close is now an instant
// CSS class toggle (.is-open) with no GSAP stagger, and the body-class scroll
// lock no longer pauses Lenis (Lenis was removed; the overflow:hidden body
// lock is the sole, load-bearing lock).
interface NavLink {
  label: string
  href: string
  /** Path that should paint aria-current="page" on this link; null = never active. */
  routeMatch: string | null
  hideSm?: boolean
}

const route = useRoute()

const isScrolled = ref(false)
const isMenuOpen = ref(false)

const isConsulting = computed(() => route.path === '/consulting')

const links = computed<NavLink[]>(() => [
  { label: 'Experiments', href: isConsulting.value ? '/#work' : '#work', routeMatch: '/' },
  { label: 'Consulting', href: '/consulting', routeMatch: '/consulting' },
  // About points to an in-page anchor on home, not its own route, so it
  // never carries aria-current — only Experiments lights up on /.
  { label: 'About', href: isConsulting.value ? '/#about' : '#about', routeMatch: null, hideSm: true },
  { label: 'Contact', href: '#contact', routeMatch: null },
])

// ---- Overlay menu element refs + handles ----
const overlayRef = ref<HTMLElement | null>(null)
const toggleRef = ref<HTMLButtonElement | null>(null)

// ---- Scroll listener (is-scrolled) — SSR-safe, registered onMounted ----
let handleScroll: (() => void) | null = null
let keydownHandler: ((event: KeyboardEvent) => void) | null = null

function focusableInOverlay(): HTMLElement[] {
  const root = overlayRef.value
  if (!root) return []
  // The overlay is `inert` + visibility:hidden when closed, so this only ever
  // runs against a visible, interactive overlay. We deliberately do NOT filter
  // on offsetParent: the overlay's opacity fade-in (CSS transition) can leave
  // offsetParent briefly unresolved on open, and that check would race that
  // frame and drop every link, leaving focus stranded outside the overlay.
  return Array.from(
    root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
  )
}

function lockScroll() {
  // The body class applies overflow:hidden so the page behind the overlay can't
  // scroll. This is the sole scroll lock since Lenis was removed (PRO-174).
  document.body.classList.add('is-menu-open')
}

function unlockScroll() {
  document.body.classList.remove('is-menu-open')
}

function trapKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
    return
  }
  if (event.key !== 'Tab') return
  const focusable = focusableInOverlay()
  if (focusable.length === 0) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  const active = document.activeElement as HTMLElement | null
  if (event.shiftKey) {
    if (active === first || !overlayRef.value?.contains(active)) {
      event.preventDefault()
      last.focus()
    }
  } else if (active === last) {
    event.preventDefault()
    first.focus()
  }
}

async function openMenu() {
  if (isMenuOpen.value) return
  isMenuOpen.value = true
  lockScroll()

  // Wait for the overlay to flip out of its inert / visibility:hidden closed
  // state (the .is-open CSS class fades it in) before moving focus into it.
  await nextTick()

  // A fast open->close (or unmount) can flip isMenuOpen back to false while we
  // were awaiting nextTick. Bail before installing the focus trap so we never
  // leave a keydown handler attached over a closed, inert overlay (closeMenu
  // already tore down whatever it could see).
  if (!isMenuOpen.value) return

  // Move focus into the overlay and install the trap.
  focusableInOverlay()[0]?.focus()
  keydownHandler = trapKeydown
  document.addEventListener('keydown', keydownHandler)
}

function closeMenu() {
  if (!isMenuOpen.value) return
  isMenuOpen.value = false
  unlockScroll()
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler)
    keydownHandler = null
  }
  // Restore focus to the trigger so keyboard users land back where they were.
  toggleRef.value?.focus()
}

function toggleMenu() {
  if (isMenuOpen.value) {
    closeMenu()
  } else {
    void openMenu()
  }
}

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
  // Make sure we never leave the body locked or a stray keydown handler behind
  // if the component unmounts while the menu is open.
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler)
    keydownHandler = null
  }
  if (typeof document !== 'undefined') {
    document.body.classList.remove('is-menu-open')
  }
})
</script>

<template>
  <header id="top" class="nav" :class="{ 'is-scrolled': isScrolled }">
    <div class="shell nav-inner">
      <NuxtLink to="/" class="wordmark" aria-label="Claudio Mendonça — home" aria-current-value="false">
        <span class="ast" aria-hidden="true">✱</span>
        <span>Claudio Mendonça</span>
      </NuxtLink>

      <!-- Desktop inline links (hidden below the overlay breakpoint via CSS). -->
      <nav class="nav-desktop" aria-label="Primary">
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

      <!-- Mobile hamburger (hidden at/above the overlay breakpoint via CSS). -->
      <button
        ref="toggleRef"
        type="button"
        class="nav-toggle"
        :class="{ 'is-open': isMenuOpen }"
        :aria-expanded="isMenuOpen"
        aria-controls="nav-overlay"
        :aria-label="isMenuOpen ? 'Close menu' : 'Open menu'"
        @click="toggleMenu"
      >
        <span class="nav-toggle__bar" aria-hidden="true" />
        <span class="nav-toggle__bar" aria-hidden="true" />
      </button>
    </div>

    <!-- Full-screen overlay menu (mobile). Always in the DOM so the GSAP/focus
         hooks have a stable target; visibility + interactivity gated by
         .is-open in CSS (and inert/hidden when closed). -->
    <nav
      id="nav-overlay"
      ref="overlayRef"
      class="nav-overlay"
      :class="{ 'is-open': isMenuOpen }"
      aria-label="Mobile"
      :aria-hidden="!isMenuOpen"
      :inert="!isMenuOpen"
    >
      <ul class="nav-overlay__list">
        <li v-for="link in links" :key="link.label" class="nav-overlay__item">
          <a
            :href="link.href"
            :aria-current="link.routeMatch && route.path === link.routeMatch ? 'page' : undefined"
            @click="closeMenu"
          >{{ link.label }}</a>
        </li>
      </ul>
    </nav>
  </header>
</template>
