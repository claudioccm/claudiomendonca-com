<!--
  GrainOverlay — global film-grain texture for the dark canvas (PRO-109, R10/R12).

  Fixed, full-viewport, pointer-events:none overlay rendering an SVG feTurbulence
  noise field at low opacity. Purely presentational and SSR-safe (no JS, no
  client-only deps), so it renders in `nuxt generate` output too.

  The subtle grain "shimmer" animates only when motion is allowed; under
  prefers-reduced-motion the grain is static. The element never intercepts
  pointer events and sits above the page vignette (base.css body::before) but
  below page content (z-index ordering documented inline).
-->
<template>
  <div class="grain-overlay" aria-hidden="true">
    <svg class="grain-overlay__svg" xmlns="http://www.w3.org/2000/svg">
      <filter id="grain-overlay-noise">
        <feTurbulence
          type="fractalNoise"
          base-frequency="0.8"
          num-octaves="2"
          stitch-tiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-overlay-noise)" />
    </svg>
  </div>
</template>

<style scoped>
.grain-overlay {
  /* The grain reads as texture sitting ON the page, so it paints above content
     (z-index 3 > .nav/main/.footer = 1). It is always non-interactive and very
     low opacity, so it never obscures text. */
  position: fixed;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  opacity: 0.045;
  mix-blend-mode: screen;
}

.grain-overlay__svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* Subtle drift so the grain feels alive — motion only. */
@media (prefers-reduced-motion: no-preference) {
  .grain-overlay__svg {
    animation: grain-drift 8s steps(6) infinite;
  }
  @keyframes grain-drift {
    0%   { transform: translate(0, 0); }
    20%  { transform: translate(-2%, 1%); }
    40%  { transform: translate(1%, -2%); }
    60%  { transform: translate(-1%, 2%); }
    80%  { transform: translate(2%, -1%); }
    100% { transform: translate(0, 0); }
  }
}
</style>
