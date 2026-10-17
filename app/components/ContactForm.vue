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

  Lead tracking (2026-10-16): an optional "How did you hear about us?" select
  (with free text for "Other") plus the session's first-touch attribution
  (UTMs, referrer, landing page — app/utils/attribution.ts) ride along in the
  payload into the notification email. Only after the function answers 2xx
  does the form fire the GA4 `generate_lead` event with the same fields.
  GA4's own enhanced-measurement form_start is untouched.
-->
<script setup lang="ts">
import { ATTRIBUTION_KEYS, readAttribution, type Attribution } from '~/utils/attribution'

type Status = 'idle' | 'submitting' | 'success' | 'error'

// Keep in sync with netlify/functions/contact.ts.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FUNCTION_PATH = '/.netlify/functions/contact'
// Keep values in sync with HEARD_FROM_OPTIONS in netlify/functions/contact.ts.
const HEARD_FROM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'google', label: 'Google search' },
  { value: 'referral', label: 'Referral' },
  { value: 'chamber_event', label: 'Chamber or event' },
  { value: 'other', label: 'Other' },
] as const
const HEARD_FROM_OTHER_MAX_LENGTH = 200

// Which placement this form is (GA4 form_name + the notification email), so
// home-page and /consulting leads can be told apart.
const props = withDefaults(defineProps<{ formName?: string }>(), { formName: 'consulting' })

type Gtag = (command: 'event', name: string, params: Record<string, string>) => void

const name = ref('')
const email = ref('')
const message = ref('')
const heardFrom = ref('')
const heardFromOther = ref('')
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

  const attribution = readAttribution()
  const heardFromDetail = heardFrom.value === 'other'
    ? heardFromOther.value.trim().slice(0, HEARD_FROM_OTHER_MAX_LENGTH)
    : ''

  try {
    const res = await fetch(FUNCTION_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value.trim(),
        email: email.value.trim(),
        message: message.value.trim(),
        heard_from: heardFrom.value,
        heard_from_other: heardFromDetail,
        ...attribution,
        form_name: props.formName,
        website: website.value,
      }),
    })
    const data = await res.json().catch(() => null) as { ok?: boolean } | null
    if (res.ok && data?.ok) {
      status.value = 'success'
      trackLead(heardFromDetail, attribution)
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

// GA4 lead event — success path only. gtag is defined by the inline snippet in
// nuxt.config.ts; it may be missing (blocked by an extension), so guard it.
function trackLead(heardFromDetail: string, attribution: Attribution | null) {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return
  const params: Record<string, string> = {
    page_path: window.location.pathname,
    form_name: props.formName,
    lead_source: heardFrom.value || 'not_given',
  }
  if (heardFromDetail) params.lead_source_detail = heardFromDetail
  if (attribution) {
    for (const key of ATTRIBUTION_KEYS) {
      // GA4 caps event param values at 100 characters.
      if (attribution[key]) params[key] = attribution[key].slice(0, 100)
    }
  }
  gtag('event', 'generate_lead', params)
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
      <label class="sr-only" for="contact-message">What keeps taking up your time?</label>
      <textarea
        id="contact-message"
        v-model="message"
        name="message"
        class="contact-form__input contact-form__textarea mono"
        rows="4"
        placeholder="Tell me about your business and one task you’d like to make easier…"
        required
        :disabled="status === 'submitting'"
      />
    </div>

    <div class="contact-form__field">
      <label class="sr-only" for="contact-heard-from">How did you hear about us? (optional)</label>
      <select
        id="contact-heard-from"
        v-model="heardFrom"
        name="heard_from"
        class="contact-form__input contact-form__select mono"
        :class="{ 'is-empty': !heardFrom }"
        :disabled="status === 'submitting'"
      >
        <option value="">How did you hear about us? (optional)</option>
        <option
          v-for="option in HEARD_FROM_OPTIONS"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <div
      v-if="heardFrom === 'other'"
      class="contact-form__field"
    >
      <label class="sr-only" for="contact-heard-from-other">Where did you hear about us?</label>
      <input
        id="contact-heard-from-other"
        v-model="heardFromOther"
        name="heard_from_other"
        type="text"
        class="contact-form__input mono"
        placeholder="Where did you hear about us?"
        :maxlength="HEARD_FROM_OTHER_MAX_LENGTH"
        :disabled="status === 'submitting'"
      >
    </div>

    <button
      type="submit"
      class="btn btn-filled contact-form__btn"
      :disabled="status === 'submitting'"
    >
      <span>{{ status === 'submitting' ? 'Sending…' : 'Find a starting point' }}</span>
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
    <p class="contact-success__sub">
      Thanks — I’ll get back to you soon.
    </p>
  </div>
</template>
