<!--
  Consulting contact form (Claudio feedback 2026-06-27: "We will need a contact
  form here … whatever email system that simplifies form > send email").

  Posts to the Netlify Function at /.netlify/functions/contact (Resend email
  send) — the same Resend setup as the newsletter, so contact + newsletter share
  one backend. Functions deploy via the CLI, so this works under the site's
  manual-deploy flow (unlike Netlify Forms, which needs the build pipeline).

  States: idle → submitting → success | error. A hidden "website" honeypot field
  catches bots (the function rejects non-empty values). Email is validated
  client-side before the round-trip; the function re-validates server-side.
  JS-only (no native fallback) — no-JS users use the "email me directly" mailto.

  NOTE: requires RESEND_API_KEY (shared with the newsletter) plus a verified
  Resend sending domain for CONTACT_FROM_EMAIL. Until those are set the function
  returns an error and the form points the visitor at the mailto fallback.
  Styles: app/assets/css/sections.css (.contact-form / .contact-success).
-->
<script setup lang="ts">
type Status = 'idle' | 'submitting' | 'success' | 'error'

// Keep in sync with netlify/functions/contact.ts.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FUNCTION_PATH = '/.netlify/functions/contact'

const name = ref('')
const email = ref('')
const message = ref('')
const website = ref('') // honeypot — must stay empty for real humans
const status = ref<Status>('idle')
const errorMessage = ref<string | null>(null)

async function submit() {
  if (status.value === 'submitting') return

  if (!name.value.trim() || !EMAIL_REGEX.test(email.value.trim()) || !message.value.trim()) {
    status.value = 'error'
    errorMessage.value = 'Add your name, a valid email, and a short message.'
    return
  }

  status.value = 'submitting'
  errorMessage.value = null

  try {
    const res = await fetch(FUNCTION_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value.trim(),
        email: email.value.trim(),
        message: message.value.trim(),
        website: website.value,
      }),
    })
    const data = await res.json().catch(() => null) as { ok?: boolean } | null
    if (res.ok && data?.ok) {
      status.value = 'success'
    }
    else {
      status.value = 'error'
      errorMessage.value = 'Couldn’t send right now — please email me directly.'
    }
  }
  catch {
    status.value = 'error'
    errorMessage.value = 'Couldn’t send right now — please email me directly.'
  }
}
</script>

<template>
  <form
    v-if="status !== 'success'"
    class="contact-form"
    novalidate
    @submit.prevent="submit"
  >
    <!-- Honeypot: hidden from humans; bots fill it and the function drops them. -->
    <p class="contact-form__hp" aria-hidden="true">
      <label>Don’t fill this out: <input v-model="website" name="website" tabindex="-1" autocomplete="off"></label>
    </p>

    <div class="contact-form__field">
      <label class="sr-only" for="contact-name">Your name</label>
      <input
        id="contact-name"
        v-model="name"
        name="name"
        type="text"
        class="contact-form__input mono"
        placeholder="Your name"
        autocomplete="name"
        required
        :disabled="status === 'submitting'"
      >
    </div>

    <div class="contact-form__field">
      <label class="sr-only" for="contact-email">Email address</label>
      <input
        id="contact-email"
        v-model="email"
        name="email"
        type="email"
        class="contact-form__input mono"
        placeholder="you@email.com"
        autocomplete="email"
        required
        :disabled="status === 'submitting'"
      >
    </div>

    <div class="contact-form__field">
      <label class="sr-only" for="contact-message">Message</label>
      <textarea
        id="contact-message"
        v-model="message"
        name="message"
        class="contact-form__input contact-form__textarea mono"
        rows="4"
        placeholder="A short note about what you’re working on…"
        required
        :disabled="status === 'submitting'"
      />
    </div>

    <button
      type="submit"
      class="btn btn-filled contact-form__btn"
      :disabled="status === 'submitting'"
    >
      <span>{{ status === 'submitting' ? 'Sending…' : 'Send message' }}</span>
      <span class="btn-arrow" aria-hidden="true">→</span>
    </button>

    <p
      v-if="errorMessage"
      class="contact-form__error mono"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </form>

  <div
    v-else
    class="contact-success"
    role="status"
  >
    <span class="contact-success__mark" aria-hidden="true" />
    <p class="contact-success__title">Message sent.</p>
    <p class="contact-success__sub mono">
      Thanks — I’ll get back to you soon.
    </p>
  </div>
</template>
