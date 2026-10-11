// Light / dark theme state.
//
// The source of truth is `data-theme` on <html>, set before first paint by the
// inline head script in nuxt.config.ts (stored choice, else the system
// preference). This composable mirrors it into shared state for ThemeToggle
// and persists an explicit choice. Until a visitor picks one, the theme keeps
// following the system preference.
export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'ccm-theme'

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function useTheme() {
  const theme = useState<Theme>('theme', () => 'dark')

  function apply(next: Theme) {
    theme.value = next
    document.documentElement.dataset.theme = next
  }

  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    apply(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage blocked: the choice still applies for this page view.
    }
  }

  /** Sync from the DOM and follow system changes. Call once, on the client. */
  function init() {
    apply(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (event: MediaQueryListEvent) => {
      if (!storedTheme()) apply(event.matches ? 'light' : 'dark')
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }

  return { theme, toggle, init }
}
