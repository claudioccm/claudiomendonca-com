<!-- PRO-179: replace with functional NewsletterBand -->
<!--
  Non-functional newsletter band (PRO-178). A clearly-marked VISUAL STUB only —
  the email field and Subscribe button are disabled and submit nothing. PRO-179
  replaces this whole component with the real Resend-backed NewsletterBand, so
  the index template references one component and the swap is a one-file change.

  Why disabled rather than a no-op handler: a disabled control is honestly
  non-interactive (no false "Thanks, you're subscribed!" affordance), screen
  readers announce it as unavailable, and there is no form submit to wire. The
  "Coming soon" note states the status in plain text. The band still renders the
  full editorial layout from Blog.dc.html so the page matches the screenshots.
-->
<template>
  <section class="newsletter-stub-section" aria-labelledby="newsletter-stub-heading">
    <div class="shell">
      <div class="newsletter-stub" data-reveal>
        <div class="newsletter-stub__copy">
          <span class="label">Edge — the newsletter</span>
          <h2 id="newsletter-stub-heading" class="newsletter-stub__title">Never miss a post.</h2>
          <p class="newsletter-stub__lead mono">An auto-generated digest of AI news &amp; research.</p>
        </div>
        <!-- Visual stub: disabled, submits nothing. Real form lands in PRO-179. -->
        <form class="newsletter-stub__form" aria-describedby="newsletter-stub-note" @submit.prevent>
          <div class="newsletter-stub__row">
            <input
              type="email"
              class="newsletter-stub__input mono"
              placeholder="you@email.com"
              aria-label="Email address"
              disabled
            >
            <button
              type="submit"
              class="newsletter-stub__btn mono"
              disabled
              aria-disabled="true"
            >
              Subscribe →
            </button>
          </div>
          <span id="newsletter-stub-note" class="newsletter-stub__note mono">
            Coming soon — sign-up isn't live yet.
          </span>
        </form>
      </div>
    </div>
  </section>
</template>
