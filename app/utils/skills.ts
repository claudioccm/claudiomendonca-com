// Skill downloads (/prompts/<slug> for a skill, 2026-10-29). The files are
// written by modules/skill-downloads at build time. Nuxt auto-imports app/utils/*.

export type SkillDownloadFormat = 'zip' | 'md' | 'view'

export function skillFiles(slug: string): { zip: string, md: string } {
  return {
    zip: `/skills/${slug}.zip`,
    md: `/skills/${slug}/SKILL.md`,
  }
}

type Gtag = (command: 'event', name: string, params: Record<string, string>) => void

// GA4 `skill_download`, same guard as trackPromptCopy: gtag comes from the
// inline snippet in nuxt.config.ts and may be blocked.
export function trackSkillDownload(slug: string, format: SkillDownloadFormat): void {
  const gtag = (window as unknown as { gtag?: Gtag }).gtag
  if (typeof gtag !== 'function') return
  try {
    gtag('event', 'skill_download', { skill: slug, format })
  }
  catch {
    // Never let analytics break the download.
  }
}
