<template>
  <div class="layout-root">
    <!-- Skip link: first focusable element, visually hidden until keyboard
         focus, then jumps focus to <main>. Motto-consistent (black on white,
         sharp corners). PRO-79 U2. -->
    <a href="#main" class="skip-link">Skip to content</a>
    <SiteNav />
    <main id="main" tabindex="-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
