import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * netlify/functions/contact.ts · lead source + attribution reach the email.
 * Resend is mocked: no mail is sent.
 */
const send = vi.fn()
vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

const { default: handler } = await import('../netlify/functions/contact')

function post(body: Record<string, unknown>) {
  return handler(new Request('http://localhost/.netlify/functions/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }))
}

const base = { name: 'Test Lead', email: 'lead@example.com', message: 'Hello', website: '' }

describe('contact function', () => {
  beforeEach(() => {
    send.mockReset()
    send.mockResolvedValue({ error: null })
    process.env.RESEND_API_KEY = 'test-key'
  })

  it('adds lead source and attribution to the email', async () => {
    const res = await post({
      ...base,
      heard_from: 'instagram',
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: 'bio',
      utm_content: '',
      referrer: 'https://l.instagram.com/',
      landing_page: '/?utm_source=instagram&utm_medium=social&utm_campaign=bio',
    })
    expect(res.status).toBe(200)
    const mail = send.mock.calls[0]![0]
    expect(mail.replyTo).toBe('lead@example.com')
    expect(mail.subject).toBe('New contact form message from Test Lead (via Instagram)')
    expect(mail.text).toContain('How they heard about us: Instagram')
    expect(mail.text).toContain('utm_source: instagram')
    expect(mail.text).toContain('utm_campaign: bio')
    expect(mail.text).toContain('utm_content: —')
    expect(mail.text).toContain('Referrer: https://l.instagram.com/')
    expect(mail.html).toContain('Landing page: /?utm_source=instagram&amp;utm_medium=social&amp;utm_campaign=bio')
  })

  it('includes the free-text detail for "other" and escapes it in html', async () => {
    await post({ ...base, heard_from: 'other', heard_from_other: 'A <b>podcast</b>' })
    const mail = send.mock.calls[0]![0]
    expect(mail.text).toContain('How they heard about us: Other: A <b>podcast</b>')
    expect(mail.html).toContain('Other: A &lt;b&gt;podcast&lt;/b&gt;')
  })

  it('accepts a submission without the optional fields', async () => {
    const res = await post(base)
    expect(res.status).toBe(200)
    const mail = send.mock.calls[0]![0]
    expect(mail.subject).toBe('New contact form message from Test Lead')
    expect(mail.text).toContain('How they heard about us: Not given')
  })

  it('ignores unknown lead sources', async () => {
    await post({ ...base, heard_from: 'evil\r\nBcc: x@y.z' })
    expect(send.mock.calls[0]![0].text).toContain('How they heard about us: Not given')
  })

  it('still rejects a filled honeypot', async () => {
    const res = await post({ ...base, website: 'spam.example', heard_from: 'instagram' })
    expect(res.status).toBe(400)
    expect(send).not.toHaveBeenCalled()
  })
})
