import { describe, it, expect, vi, afterEach } from 'vitest'
import { copyText, promptSlug, splitPlaceholders, trackPromptCopy } from '~/utils/prompts'
import { includePromptDrafts } from '~/utils/promptDrafts'

/**
 * app/utils/prompts.ts · prompt gallery helpers (2026-10-16).
 */
describe('splitPlaceholders', () => {
  it('marks bracketed parts and keeps the text intact', () => {
    const text = 'You write quotes for [BUSINESS NAME], a [TRADE] in [TOWN].'
    const segments = splitPlaceholders(text)
    expect(segments.filter(s => s.placeholder).map(s => s.text)).toEqual(['[BUSINESS NAME]', '[TRADE]', '[TOWN]'])
    expect(segments.map(s => s.text).join('')).toBe(text)
  })

  it('returns one plain segment when there are no brackets', () => {
    expect(splitPlaceholders('Interview me about the job.')).toEqual([
      { text: 'Interview me about the job.', placeholder: false },
    ])
  })

  it('ignores brackets with no letters or digits, like a literal [...]', () => {
    expect(splitPlaceholders('"items": [...] for [7] days').filter(s => s.placeholder).map(s => s.text)).toEqual(['[7]'])
  })

  it('does not join brackets across lines', () => {
    const segments = splitPlaceholders('valid for [30\ndays]')
    expect(segments.every(s => !s.placeholder)).toBe(true)
  })
})

describe('promptSlug', () => {
  it('takes the last path segment', () => {
    expect(promptSlug('/prompts/quote-assistant')).toBe('quote-assistant')
    expect(promptSlug('/prompts/quote-assistant/')).toBe('quote-assistant')
  })
})

describe('copyText', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the Clipboard API when present', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue({ writeText } as unknown as Clipboard)
    expect(await copyText('hello')).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('falls back to execCommand when the Clipboard API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.spyOn(navigator, 'clipboard', 'get').mockReturnValue({ writeText } as unknown as Clipboard)
    const exec = vi.fn().mockReturnValue(true)
    ;(document as unknown as { execCommand: typeof exec }).execCommand = exec
    expect(await copyText('hello')).toBe(true)
    expect(exec).toHaveBeenCalledWith('copy')
    expect(document.querySelector('textarea')).toBeNull()
  })
})

describe('trackPromptCopy', () => {
  afterEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag
  })

  it('sends prompt_copy with slug, category and part', () => {
    const gtag = vi.fn()
    ;(window as unknown as { gtag: typeof gtag }).gtag = gtag
    trackPromptCopy('quote-assistant', 'Quotes & sales', 1)
    expect(gtag).toHaveBeenCalledWith('event', 'prompt_copy', {
      prompt_slug: 'quote-assistant',
      prompt_category: 'Quotes & sales',
      prompt_part: 1,
    })
  })

  it('does nothing when gtag is blocked', () => {
    expect(() => trackPromptCopy('x', 'Admin', 1)).not.toThrow()
  })
})

describe('includePromptDrafts', () => {
  it('includes drafts in dev and on Netlify previews', () => {
    expect(includePromptDrafts({ NODE_ENV: 'development' })).toBe(true)
    expect(includePromptDrafts({ NODE_ENV: 'production', CONTEXT: 'deploy-preview' })).toBe(true)
    expect(includePromptDrafts({ NODE_ENV: 'production', CONTEXT: 'branch-deploy' })).toBe(true)
  })

  it('excludes drafts from production and context-less production builds', () => {
    expect(includePromptDrafts({ NODE_ENV: 'production', CONTEXT: 'production' })).toBe(false)
    expect(includePromptDrafts({ NODE_ENV: 'production' })).toBe(false)
    expect(includePromptDrafts({ NODE_ENV: 'production', CONTEXT: 'dev' })).toBe(false)
  })
})
