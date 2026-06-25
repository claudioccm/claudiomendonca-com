<template>
  <div class="layout-root">
    <!-- Skip link: first focusable element, visually hidden until keyboard
         focus, then jumps focus to <main>. PRO-79 U2. -->
    <a href="#main" class="skip-link">Skip to content</a>

    <!-- Global film-grain texture over the dark canvas (PRO-109). Fixed,
         non-interactive, SSR-safe. -->
    <GrainOverlay />

    <!-- PRO-174: SmoothScroll (Lenis) and CustomCursor were retired with the
         motion stack. The page chrome now renders directly — native scrolling,
         native cursor, all content present in SSR / no-JS. -->
    <SiteNav />
    <main id="main" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
