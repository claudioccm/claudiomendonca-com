// Lead attribution (2026-10-16). A lead arrived from Instagram that GA4 couldn't
// attribute, so on landing we record where the visitor came from — UTM params,
// referrer, landing page — into sessionStorage (first touch for the browser
// session). ContactForm.vue sends it with the submission; the contact function
// puts it in the notification email and the form adds it to the GA4
// `generate_lead` event.
//
// Captured by app/plugins/attribution.client.ts on the first page load only.
// sessionStorage can throw (private mode, blocked storage), so every access is
// guarded and a failure simply means "no attribution", never a broken form.

export const ATTRIBUTION_STORAGE_KEY = 'ccm-attribution'

// Caps keep a crafted URL from bloating storage or the payload. Keep in sync
// with netlify/functions/contact.ts.
const UTM_MAX_LENGTH = 200
const URL_MAX_LENGTH = 500

export interface Attribution {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  referrer: string
  landing_page: string
}

export const ATTRIBUTION_KEYS: (keyof Attribution)[] = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'referrer',
  'landing_page',
]

function clip(value: string | null | undefined, max: number): string {
  return (value ?? '').trim().slice(0, max)
}

// Pure: derive attribution from a landing URL and document.referrer.
export function attributionFromLanding(href: string, referrer: string): Attribution {
  let url: URL | null = null
  try {
    url = new URL(href)
  }
  catch {
    // Not a parseable URL — record what we can.
  }
  const params = url?.searchParams
  return {
    utm_source: clip(params?.get('utm_source'), UTM_MAX_LENGTH),
    utm_medium: clip(params?.get('utm_medium'), UTM_MAX_LENGTH),
    utm_campaign: clip(params?.get('utm_campaign'), UTM_MAX_LENGTH),
    utm_content: clip(params?.get('utm_content'), UTM_MAX_LENGTH),
    referrer: clip(referrer, URL_MAX_LENGTH),
    landing_page: clip(url ? url.pathname + url.search : href, URL_MAX_LENGTH),
  }
}

// Client only. First touch wins: an existing record for this session is kept.
export function captureAttribution(): void {
  try {
    if (window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)) return
    const attribution = attributionFromLanding(window.location.href, document.referrer)
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution))
  }
  catch {
    // Storage unavailable — skip attribution.
  }
}

// Client only. Returns the stored first-touch record, or null.
export function readAttribution(): Attribution | null {
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Record<keyof Attribution, unknown>>
    const result = {} as Attribution
    for (const key of ATTRIBUTION_KEYS) {
      const value = parsed[key]
      result[key] = typeof value === 'string' ? value : ''
    }
    return result
  }
  catch {
    return null
  }
}
