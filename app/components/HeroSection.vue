<!-- Shared services hero with headline, copy, actions, and optional supporting content. -->

<template>
  <section class="hero">
    <div class="hero-bg" aria-hidden="true">
      <div class="hero-bg-fallback" />
      <!-- Interactive dot-field, matching the home hero (PRO feedback). Decorative,
           client-built, reduced-motion-safe. Only /consulting uses HeroSection. -->
      <HeroDotField />
    </div>

    <div class="shell">
      <slot name="headline" />
      <p class="hero-sub">
        <slot name="sub" />
      </p>
      <div class="hero-cta-row">
        <slot name="ctas" />
      </div>
      <slot name="after" />
    </div>
  </section>
</template>
