import { Resend } from 'resend'

// Consulting contact form handler (Claudio feedback 2026-06-27). Receives the
// JSON the form posts, validates it, and emails the submission via Resend to the
// site owner. Mirrors newsletter-subscribe.ts conventions (JSON in/out, honeypot,
// body-size guard, never leak upstream detail).
//
// Required env (set in the Netlify dashboard, same RESEND_API_KEY as the
// newsletter):
//   RESEND_API_KEY    — Resend API key.
//   CONTACT_TO_EMAIL  — where submissions are delivered (default below).
//   CONTACT_FROM_EMAIL— a verified Resend sending identity, e.g.
//                       "Claudio Mendonça <contact@ccm-labs.ca>". The
//                       domain MUST be verified in Resend or the send fails.

// Keep validation in sync with app/components/ContactForm.vue.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_MAX_LENGTH = 254
const NAME_MAX_LENGTH = 120
const MESSAGE_MAX_LENGTH = 5000
// Messages can be a few paragraphs; 16 KB is generous for the real shape and
// still rejects abusive bodies before parsing. Defense in depth only.
const MAX_BODY_BYTES = 16 * 1024
// Hidden honeypot field — humans never fill it; bots that auto-fill every input
// populate it and are rejected silently.
const HONEYPOT_FIELD = 'website'

// Lead source + attribution (2026-10-16). All optional; unknown or oversized
// values are dropped/clipped, never rejected, so tracking can't block a lead.
// Keep in sync with ContactForm.vue and app/utils/attribution.ts.
const HEARD_FROM_OPTIONS: Record<string, string> = {
  instagram: 'Instagram',
  google: 'Google search',
  referral: 'Referral',
  chamber_event: 'Chamber or event',
  other: 'Other',
}
const HEARD_FROM_OTHER_MAX_LENGTH = 200
// Which form placement sent the lead (ContactSection formName).
const FORM_NAMES: Record<string, string> = {
  home: 'Home page',
  consulting: 'Services page',
}
const UTM_MAX_LENGTH = 200
const URL_MAX_LENGTH = 500
const ATTRIBUTION_FIELDS = [
  { key: 'utm_source', label: 'utm_source', max: UTM_MAX_LENGTH },
  { key: 'utm_medium', label: 'utm_medium', max: UTM_MAX_LENGTH },
  { key: 'utm_campaign', label: 'utm_campaign', max: UTM_MAX_LENGTH },
  { key: 'utm_content', label: 'utm_content', max: UTM_MAX_LENGTH },
  { key: 'referrer', label: 'Referrer', max: URL_MAX_LENGTH },
  { key: 'landing_page', label: 'Landing page', max: URL_MAX_LENGTH },
] as const

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'claudio@ccmdesign.ca'
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'Claudio Mendonça <contact@ccm-labs.ca>'

type SuccessBody = { ok: true }
type ErrorCode =
  | 'bad_request'
  | 'invalid_input'
  | 'method_not_allowed'
  | 'upstream_error'
  | 'server_misconfigured'
  | 'server_error'
type ErrorBody = { ok: false, error: ErrorCode }

function jsonResponse(status: number, body: SuccessBody | ErrorBody): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function asString(payload: unknown, key: string): string | undefined {
  if (payload && typeof payload === 'object' && key in payload) {
    const value = (payload as Record<string, unknown>)[key]
    if (typeof value === 'string') return value
  }
  return undefined
}

// Strip CR/LF from single-line fields so a crafted name/email can't inject
// extra email headers (defense in depth; Resend builds the message, not us).
function sanitizeLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'method_not_allowed' })
  }

  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonResponse(400, { ok: false, error: 'bad_request' })
  }

  const contentLengthHeader = req.headers.get('content-length')
  if (contentLengthHeader !== null) {
    const contentLength = Number(contentLengthHeader)
    if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) {
      return jsonResponse(400, { ok: false, error: 'bad_request' })
    }
  }

  let payload: unknown
  try {
    payload = await req.json()
  }
  catch {
    return jsonResponse(400, { ok: false, error: 'bad_request' })
  }

  // Honeypot: reject silently if filled.
  const honeypot = asString(payload, HONEYPOT_FIELD)
  if (honeypot && honeypot.length > 0) {
    console.warn('[contact] honeypot tripped')
    return jsonResponse(400, { ok: false, error: 'bad_request' })
  }

  const name = sanitizeLine(asString(payload, 'name') ?? '')
  const email = sanitizeLine(asString(payload, 'email') ?? '')
  const message = (asString(payload, 'message') ?? '').trim()

  if (
    name.length === 0 || name.length > NAME_MAX_LENGTH
    || email.length === 0 || email.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(email)
    || message.length === 0 || message.length > MESSAGE_MAX_LENGTH
  ) {
    return jsonResponse(400, { ok: false, error: 'invalid_input' })
  }

  const heardFromKey = sanitizeLine(asString(payload, 'heard_from') ?? '')
  const heardFrom = HEARD_FROM_OPTIONS[heardFromKey] ?? ''
  const heardFromOther = heardFromKey === 'other'
    ? sanitizeLine(asString(payload, 'heard_from_other') ?? '').slice(0, HEARD_FROM_OTHER_MAX_LENGTH)
    : ''
  const sourceLine = heardFrom
    ? (heardFromOther ? `${heardFrom}: ${heardFromOther}` : heardFrom)
    : 'Not given'
  const formName = FORM_NAMES[sanitizeLine(asString(payload, 'form_name') ?? '')] ?? 'Unknown'
  const attribution = ATTRIBUTION_FIELDS.map(({ key, label, max }) => ({
    label,
    value: sanitizeLine(asString(payload, key) ?? '').slice(0, max),
  }))
  const attributionText = attribution
    .map(({ label, value }) => `${label}: ${value || '—'}`)
    .join('\n')
  const attributionHtml = attribution
    .map(({ label, value }) => `${escapeHtml(label)}: ${escapeHtml(value || '—')}`)
    .join('<br>')

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] missing env: RESEND_API_KEY')
    return jsonResponse(500, { ok: false, error: 'server_misconfigured' })
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New contact form message from ${name}${heardFrom ? ` (via ${heardFrom})` : ''}`,
      text: `From: ${name} <${email}>\n\n${message}`
        + `\n\n---\nHow they heard about us: ${sourceLine}\nForm: ${formName}\n${attributionText}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`
        + `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`
        + `<hr><p><strong>How they heard about us:</strong> ${escapeHtml(sourceLine)}</p>`
        + `<p style="color:#666;font-size:13px">Form: ${escapeHtml(formName)}<br>${attributionHtml}</p>`,
    })

    if (error) {
      const errObj = error as { name?: unknown, message?: unknown, statusCode?: unknown }
      console.error('[contact] resend error', {
        name: typeof errObj.name === 'string' ? errObj.name : undefined,
        message: typeof errObj.message === 'string' ? errObj.message : undefined,
        statusCode: typeof errObj.statusCode === 'number' ? errObj.statusCode : undefined,
      })
      return jsonResponse(502, { ok: false, error: 'upstream_error' })
    }

    console.info('[contact] ok')
    return jsonResponse(200, { ok: true })
  }
  catch (err) {
    const message
      = err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : String(err)
    console.error('[contact] unexpected error', { message })
    return jsonResponse(500, { ok: false, error: 'server_error' })
  }
}
