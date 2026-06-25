import { Resend } from 'resend'

// Shared with the client; keep the email rules in sync with
// app/components/NewsletterBand.vue (it validates the same shape before posting).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_MAX_LENGTH = 254
// Legitimate signup payload is ~60 bytes. 1 KB is generous for the real shape
// and lets us reject oversized bodies before they are parsed. Defense in depth
// only — Content-Length can be spoofed or absent on chunked requests.
const MAX_BODY_BYTES = 1024
// Hidden honeypot field name. Humans do not see or fill this input; bots that
// auto-fill every text input will populate it. Non-empty values are rejected
// silently as bad_request without calling Resend.
const HONEYPOT_FIELD = 'website'

type SuccessBody = { ok: true, duplicate: boolean }
type ErrorCode =
  | 'invalid_email'
  | 'bad_request'
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

// Narrow predicate for Resend's 'already exists' error. Resend returns either
//   { name: 'validation_error', statusCode: 409|422, message: '... already exists ...' }
// or (older shapes) a generic error whose message contains 'already exists'.
// We check the structured signals first (statusCode 409/422, or name
// 'validation_error' paired with a duplicate phrase) and fall back to a pure
// message substring match so we degrade gracefully if the SDK tweaks its shape.
function isDuplicateContactError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as { name?: unknown, message?: unknown, statusCode?: unknown }
  const message = typeof err.message === 'string' ? err.message.toLowerCase() : ''
  const name = typeof err.name === 'string' ? err.name : ''
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : undefined
  const messageLooksLikeDuplicate
    = message.includes('already exists')
      || message.includes('already subscribed')
      || message.includes('duplicate')
      || message.includes('already in audience')

  // Strong signal: HTTP 409 Conflict is unambiguously "already exists".
  if (statusCode === 409) return true
  // A 422 validation_error is NOT a duplicate by itself — Resend returns
  // validation_error for many input problems (bad email, missing audience, …).
  // Only treat it as a duplicate when the message actually says so, otherwise a
  // genuine validation failure would be reported to the user as a false success.
  if (statusCode === 422 && messageLooksLikeDuplicate) return true
  // Named validation error paired with a duplicate phrase.
  if (name === 'validation_error' && messageLooksLikeDuplicate) return true
  // Fallback: pure message substring match for older/unknown shapes.
  return messageLooksLikeDuplicate
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'method_not_allowed' })
  }

  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonResponse(400, { ok: false, error: 'bad_request' })
  }

  // Reject oversized bodies before parsing. Content-Length is advisory (can be
  // absent on chunked transfer) so this is defense in depth, not a guarantee.
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

  // Honeypot: if a bot auto-filled the hidden field, reject silently.
  if (
    payload
    && typeof payload === 'object'
    && HONEYPOT_FIELD in payload
    && typeof (payload as Record<string, unknown>)[HONEYPOT_FIELD] === 'string'
    && ((payload as Record<string, string>)[HONEYPOT_FIELD] ?? '').length > 0
  ) {
    console.warn('[newsletter-subscribe] honeypot tripped')
    return jsonResponse(400, { ok: false, error: 'bad_request' })
  }

  const rawEmail
    = payload && typeof payload === 'object' && 'email' in payload
      ? (payload as { email: unknown }).email
      : undefined
  if (typeof rawEmail !== 'string') {
    return jsonResponse(400, { ok: false, error: 'invalid_email' })
  }

  const email = rawEmail.trim()
  if (
    email.length === 0
    || email.length > EMAIL_MAX_LENGTH
    || !EMAIL_REGEX.test(email)
  ) {
    return jsonResponse(400, { ok: false, error: 'invalid_email' })
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_SEGMENT_ID

  if (!apiKey) {
    console.error('[newsletter-subscribe] missing env: RESEND_API_KEY')
    return jsonResponse(500, { ok: false, error: 'server_misconfigured' })
  }
  if (!audienceId) {
    console.error('[newsletter-subscribe] missing env: RESEND_SEGMENT_ID')
    return jsonResponse(500, { ok: false, error: 'server_misconfigured' })
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed: false,
    })

    if (error) {
      if (isDuplicateContactError(error)) {
        console.info('[newsletter-subscribe] ok', { duplicate: true })
        return jsonResponse(200, { ok: true, duplicate: true })
      }
      const errObj = error as {
        name?: unknown
        message?: unknown
        statusCode?: unknown
      }
      console.error('[newsletter-subscribe] resend error', {
        name: typeof errObj.name === 'string' ? errObj.name : undefined,
        message: typeof errObj.message === 'string' ? errObj.message : undefined,
        statusCode:
          typeof errObj.statusCode === 'number' ? errObj.statusCode : undefined,
      })
      return jsonResponse(502, { ok: false, error: 'upstream_error' })
    }

    console.info('[newsletter-subscribe] ok', { duplicate: false })
    return jsonResponse(200, { ok: true, duplicate: false })
  }
  catch (err) {
    const message
      = err && typeof err === 'object' && 'message' in err
        ? String((err as { message?: unknown }).message)
        : String(err)
    console.error('[newsletter-subscribe] unexpected error', { message })
    return jsonResponse(500, { ok: false, error: 'server_error' })
  }
}
