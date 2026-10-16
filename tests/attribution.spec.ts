import { describe, it, expect, beforeEach } from 'vitest'
import {
  ATTRIBUTION_STORAGE_KEY,
  attributionFromLanding,
  captureAttribution,
  readAttribution,
} from '~/utils/attribution'

/**
 * app/utils/attribution.ts · first-touch lead attribution (2026-10-16).
 */
describe('attributionFromLanding', () => {
  it('reads UTMs, referrer and landing page', () => {
    const a = attributionFromLanding(
      'https://ccm-labs.ca/consulting?utm_source=instagram&utm_medium=social&utm_campaign=bio',
      'https://l.instagram.com/',
    )
    expect(a).toEqual({
      utm_source: 'instagram',
      utm_medium: 'social',
      utm_campaign: 'bio',
      utm_content: '',
      referrer: 'https://l.instagram.com/',
      landing_page: '/consulting?utm_source=instagram&utm_medium=social&utm_campaign=bio',
    })
  })

  it('returns empty fields for a direct visit and clips long values', () => {
    const a = attributionFromLanding(`https://ccm-labs.ca/?utm_source=${'x'.repeat(300)}`, '')
    expect(a.utm_source).toHaveLength(200)
    expect(a.utm_medium).toBe('')
    expect(a.referrer).toBe('')
  })
})

describe('captureAttribution / readAttribution', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('keeps the first touch for the session', () => {
    window.history.replaceState(null, '', '/?utm_source=instagram&utm_campaign=bio')
    captureAttribution()
    window.history.replaceState(null, '', '/consulting?utm_source=google')
    captureAttribution()
    const a = readAttribution()
    expect(a?.utm_source).toBe('instagram')
    expect(a?.utm_campaign).toBe('bio')
    expect(a?.landing_page).toBe('/?utm_source=instagram&utm_campaign=bio')
  })

  it('returns null when nothing (or junk) is stored', () => {
    expect(readAttribution()).toBeNull()
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, '{not json')
    expect(readAttribution()).toBeNull()
  })
})
