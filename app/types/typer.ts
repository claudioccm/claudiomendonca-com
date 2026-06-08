/**
 * Shared configuration shape for the hero typewriter effect.
 *
 * Single source of truth for the 5 numeric tuning fields. Consumed by:
 *  - `app/components/TypewriterHeadline.vue` (props)
 *  - `app/components/TypewriterTuner.vue`    (`defineModel<TyperConfig>`)
 *  - `app/pages/index.vue`                   (`reactive<TyperConfig>({...})`)
 *
 * See PRO-95 audit · Dim 3.
 */
export interface TyperConfig {
  /** Delay between typed characters, ms. */
  typeMs: number
  /** Delay between deleted characters, ms. */
  deleteMs: number
  /** Pause on a fully-typed word before deleting, ms. */
  holdMs: number
  /** Pause on the empty line between words, ms. */
  betweenMs: number
  /** Cursor blink period while resting, ms. */
  cursorBlinkMs: number
}
