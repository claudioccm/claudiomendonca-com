<template>
  <div class="layout-root">
    <!-- Skip link: first focusable element, visually hidden until keyboard
         focus, then jumps focus to <main>. PRO-79 U2. -->
    <a href="#main" class="skip-link">Skip to content</a>

    <!-- Global film-grain texture over the dark canvas (PRO-109). Fixed,
         non-interactive, SSR-safe. -->
    <GrainOverlay />

    <!-- Global custom cursor (PRO-110). Capability-gated: only renders on fine
         pointers with motion allowed; inert (and native cursor intact) on touch
         / reduced-motion. SSR-safe — no element on the server. -->
    <CustomCursor />

    <!-- SmoothScroll provider seam (PRO-109). Renders its slot directly so
         content is present in SSR / no-JS; the Lenis instance is created in
         the client-only lenis plugin and gated off on reduced-motion/touch. -->
    <SmoothScroll>
      <SiteNav />
      <main id="main" tabindex="-1">
        <slot />
      </main>
      <SiteFooter />
    </SmoothScroll>
  </div>
</template>
