<!--
  Consulting contact form (Claudio feedback 2026-06-27: "We will need a contact
  form here … whatever email system that simplifies form > send email").

  Uses NETLIFY FORMS — no API keys, no backend code. The form is prerendered into
  the static HTML by `nuxt generate`, so Netlify detects it at deploy time and
  emails submissions to the site owner (and stores them under Forms in the
  dashboard). A hidden `bot-field` honeypot is declared via `netlify-honeypot`.

  Progressive enhancement: without JS the form does a native POST to "/" and
  Netlify shows its default success page. With JS we intercept, POST the
  url-encoded body to "/" via fetch, and swap to an inline success state — no
  navigation. States: idle → submitting → success | error.

  NOTE: Netlify "Forms" must be enabled for the site (default on). If submissions
  don't arrive, enable Forms in the Netlify dashboard. Styles:
  app/assets/css/sections.css (.contact-form / .contact-success).
-->
<script setup lang="ts">
type Status = 'idle' | 'submitting' | 'success' | 'error'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const name = ref('')
const email = ref('')
const message = ref('')
const botField = ref('') // honeypot — must stay empty for real humans
const status = ref<Status>('idle')
const errorMessage = ref<string | null>(null)

function encode(data: Record<string, string>): string {
  return Object.keys(data)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(data[k] ?? '')}`)
    .join('&')
}

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
    // fetch() only rejects on network failure, not on 4xx/5xx — so check the
    // status explicitly, otherwise a 404 (e.g. Netlify Forms not detecting the
    // form) would be reported as a false success.
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({
        'form-name': 'contact',
        'name': name.value.trim(),
        'email': email.value.trim(),
        'message': message.value.trim(),
        'bot-field': botField.value,
      }),
    })
    if (res.ok) {
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
    name="contact"
    method="POST"
    data-netlify="true"
    netlify-honeypot="bot-field"
    @submit.prevent="submit"
  >
    <!-- Netlify needs the form name in the POST body for AJAX submits. -->
    <input type="hidden" name="form-name" value="contact">

    <!-- Honeypot: hidden from humans, bots fill it and Netlify drops them. -->
    <p class="contact-form__hp" aria-hidden="true">
      <label>Don’t fill this out: <input v-model="botField" name="bot-field" tabindex="-1" autocomplete="off"></label>
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
