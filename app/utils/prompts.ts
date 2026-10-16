// Prompt gallery helpers (/prompts, 2026-10-16). Nuxt auto-imports app/utils/*.

export interface PromptSegment {
  text: string
  /** True for a `[BRACKETED]` part the reader swaps for their own detail. */
  placeholder: boolean
}

// Split prompt text into plain runs and `[placeholder]` runs so the page can
// mark the parts to swap. Joining every segment's text gives back the input.
export function splitPlaceholders(text: string): PromptSegment[] {
  const segments: PromptSegment[] = []
  const pattern = /\[[^[\]\n]+\]/g
  let last = 0
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) segments.push({ text: text.slice(last, start), placeholder: false })
    segments.push({ text: match[0], placeholder: true })
    last = start + match[0].length
  }
  if (last < text.length) segments.push({ text: text.slice(last), placeholder: false })
  return segments
}

// The slug is the file name: /prompts/<slug>.
export function promptSlug(path: string): string {
  return path.split('/').filter(Boolean).pop() ?? ''
}

// Client only. Clipboard API first; a hidden-textarea fallback covers older
// browsers and non-secure contexts. Resolves false when both fail.
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  }
  catch {
    // Permission denied or unavailable — try the fallback.
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
  catch {
    return false
  }
}

type Gtag = (command: 'event', name: string, params: Record<string, string | number>) => void

// GA4 `prompt_copy` event, same guard as ContactForm's `generate_lead`: gtag is
// defined by the inline snippet in nuxt.config.ts and may be blocked.
export function trackPromptCopy(slug: string, category: string, part: number): void {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return
  gtag('event', 'prompt_copy', {
    prompt_slug: slug,
    prompt_category: category,
    prompt_part: part,
  })
}
