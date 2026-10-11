/**
 * Formatting helpers. Nuxt auto-imports `app/utils/*`, so consumers do not
 * need an explicit import.
 *
 * See PRO-95 audit · Dim 4.
 */

/**
 * Pad a numeric index to a 2-digit string ("01", "02", …). Used by the
 * experiments grid and consulting offerings list to render the per-item
 * idx label. The data layer stores plain numbers; padding is presentational.
 */
export function padIndex(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Format an ISO-8601 date string as a short "MMM YYYY" (abbreviated, e.g.
 * "Mar 2026") or long "MMMM YYYY" (full, e.g. "March 2026") month + year.
 * Used by the Writing index cards (short) and post header (long).
 *
 * The `en-US` locale + UTC timeZone are pinned so prerender (server) and
 * hydration (client) agree byte-for-byte regardless of the host's locale or
 * timezone — a mismatch would trip a hydration warning. The seed
 * `writing.date` frontmatter carries a `Z`-suffixed ISO datetime.
 */
export function formatMonthYear(iso: string, long = false): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    month: long ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Split a "Starting part: rest of the title" title into a brow (kicker) and
 * the title proper. Only the first ": " splits, and both sides must be
 * non-empty; anything else comes back whole with no brow. A colon without a
 * following space ("10:30", "https://…") never splits.
 */
export function splitTitle(title: string): { brow: string | null, title: string } {
  const at = title.indexOf(': ')
  if (at < 1) return { brow: null, title }
  const rest = title.slice(at + 2).trim()
  if (!rest) return { brow: null, title }
  return { brow: title.slice(0, at).trim(), title: rest }
}
