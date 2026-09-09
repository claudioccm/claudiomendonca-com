<!--
  Functional newsletter band (PRO-179) — replaces NewsletterStub. An editorial,
  fully-monochrome restyle of the edge repo's SubscribeBand.vue. Captures an
  email and POSTs it to the Netlify Function at
  /.netlify/functions/newsletter-subscribe (Resend Audiences API).

  States: idle → submitting → success | error. A hidden honeypot field
  ("website") catches bots. Email is validated client-side before the network
  round-trip; the function re-validates server-side regardless.

  Styling: reuses the global `.newsletter-stub*` classes (app/assets/css/
  sections.css) so the band matches the established editorial layout; only the
  new state-specific bits (success / error / honeypot / submitting) are styled
  in the scoped block below. Monochrome only — paper / ink / dim / faint /
  hairline; NO chromatic accent.
-->
<script setup lang="ts">
type Status = 'idle' | 'submitting' | 'success' | 'error'

// Keep in sync with netlify/functions/newsletter-subscribe.ts.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_MAX_LENGTH = 254

const FUNCTION_PATH = '/.netlify/functions/newsletter-subscribe'

const email = ref('')
const website = ref('') // honeypot — must stay empty for real humans
const status = ref<Status>('idle')
const errorMessage = ref<string | null>(null)

function isValidEmail(value: string): boolean {
  const trimmed = value.trim()
  return (
    trimmed.length > 0
    && trimmed.length <= EMAIL_MAX_LENGTH
    && EMAIL_REGEX.test(trimmed)
  )
}

async function submit() {
  if (status.value === 'submitting') return

  // Client-side validation — catch the obvious-invalid case before the network.
  // The server re-validates, so this is UX, not the security boundary.
  if (!isValidEmail(email.value)) {
    status.value = 'error'
    errorMessage.value = 'Enter a valid email address.'
    return
  }

  status.value = 'submitting'
  errorMessage.value = null

  try {
    const res = await $fetch<{ ok: boolean, error?: string }>(FUNCTION_PATH, {
      method: 'POST',
      body: { email: email.value.trim(), website: website.value },
    })
    if (res?.ok) {
      status.value = 'success'
    }
    else {
      status.value = 'error'
      errorMessage.value = 'Something went wrong — try again.'
    }
  }
  catch {
    // Never surface upstream/HTTP detail; the function already shields it.
    status.value = 'error'
    errorMessage.value = 'Something went wrong — try again.'
  }
}
</script>

<template>
  <section
    id="newsletter"
    class="newsletter-stub-section"
    aria-labelledby="newsletter-heading"
  >
    <div class="shell">
      <div class="newsletter-stub" data-reveal>
        <div class="newsletter-stub__copy">
          <h2 id="newsletter-heading" class="newsletter-stub__title">
            The newsletter.
          </h2>
          <p class="newsletter-stub__lead mono">
            Occasional notes from the work — what I'm building with AI, what
            holds up in production, and what doesn't. Sent only when there's
            something worth your inbox.
          </p>
        </div>

        <form
          v-if="status !== 'success'"
          class="newsletter-stub__form"
          novalidate
          aria-describedby="newsletter-note"
          @submit.prevent="submit"
        >
          <div class="newsletter-stub__row">
            <label class="sr-only" for="newsletter-email">Email address</label>
            <input
              id="newsletter-email"
              v-model="email"
              type="email"
              class="newsletter-stub__input mono"
              placeholder="you@email.com"
              autocomplete="email"
              required
              :disabled="status === 'submitting'"
            >
            <button
              type="submit"
              class="newsletter-stub__btn mono"
              :disabled="status === 'submitting'"
            >
              {{ status === 'submitting' ? 'Subscribing…' : 'Subscribe →' }}
            </button>
          </div>

          <!--
            Honeypot: hidden from humans (off-screen, not announced, not
            tabbable, autofill off). Bots that fill every field populate it and
            the function rejects them. aria-hidden + tabindex keep it out of the
            a11y tree and keyboard order.
          -->
          <div class="newsletter-honeypot" aria-hidden="true">
            <label for="newsletter-website">Leave this field empty</label>
            <input
              id="newsletter-website"
              v-model="website"
              type="text"
              name="website"
              tabindex="-1"
              autocomplete="off"
            >
          </div>

          <p
            v-if="errorMessage"
            class="newsletter-stub__error mono"
            role="alert"
          >
            {{ errorMessage }}
          </p>
          <span
            v-else
            id="newsletter-note"
            class="newsletter-stub__note mono"
          >
            No spam. Unsubscribe anytime.
          </span>
        </form>

        <div
          v-else
          class="newsletter-success"
          role="status"
        >
          <span class="newsletter-success__mark" aria-hidden="true" />
          <p class="newsletter-success__title">You're on the list.</p>
          <p class="newsletter-success__sub mono">
            The next one will land in your inbox.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Layout, title, eyebrow, input + button all inherit the global
   `.newsletter-stub*` rules in sections.css. Only the live-state additions live
   here. All colors are monochrome tokens — no accent. */

.newsletter-stub__error {
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--dim);
  margin: 0;
}

.newsletter-success {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.newsletter-success__mark {
  width: 32px;
  height: 2px;
  background: var(--paper);
  margin-bottom: 8px;
}
.newsletter-success__title {
  font-family: var(--font-disp);
  font-weight: 400;
  font-size: clamp(28px, 4vw, 48px);
  line-height: 0.95;
  letter-spacing: -0.01em;
  margin: 0;
  color: var(--paper);
}
.newsletter-success__sub {
  font-size: 12px;
  line-height: 1.7;
  color: var(--dim);
  margin: 0;
}

/* Honeypot: visually + a11y hidden, still in the DOM so bots fill it.
   Not display:none — some bots skip hidden inputs; off-screen is more reliable. */
.newsletter-honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
</style>
