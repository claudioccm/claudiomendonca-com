<!--
  #contact band: intro copy + ContactForm. Shared by /consulting and the home
  page (Claudio 2026-10-16: "just point the CTAs to it. Add it at the bottom of
  the homepage too."). `formName` tells the placements apart in GA4
  (`generate_lead` form_name) and in the notification email.
  Styles: app/assets/css/sections.css (.contact-section / .contact-grid).
-->
<script setup lang="ts">
interface Props {
  heading: string
  body: string
  /** Optional mailto fallback shown under the intro copy. */
  mailto?: string
  /** Placement id sent as form_name: 'home' | 'consulting'. */
  formName: string
  screenLabel?: string
}

defineProps<Props>()
</script>

<template>
  <section id="contact" class="contact-section" :data-screen-label="screenLabel">
    <div class="shell">
      <div class="contact-grid">
        <div class="contact-intro" data-reveal>
          <h2 class="contact-intro__title">{{ heading }}</h2>
          <p class="contact-intro__body">{{ body }}</p>
          <a
            v-if="mailto"
            class="contact-intro__mail mono"
            :href="mailto"
          >or email me directly →</a>
        </div>
        <div data-reveal>
          <ContactForm :form-name="formName" />
        </div>
      </div>
    </div>
  </section>
</template>
