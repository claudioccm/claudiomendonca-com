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
