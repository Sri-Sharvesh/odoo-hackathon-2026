import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const STORAGE_KEY = 'transitops.theme'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Owns the light/dark theme and persists it. Toggling reloads the page rather than
 * just flipping the `.dark` class at runtime: Tailwind v4 registers theme colours via
 * `@property` with `inherits: false` (so transitions interpolate cleanly), and Chromium
 * fails to invalidate that non-inherited value back to its initial state on descendant
 * elements when the class is dynamically removed — a real engine bug, not a CSS mistake.
 * A reload sidesteps it entirely: `index.html`'s inline script applies the `.dark` class
 * from localStorage before first paint, so there's no flash of the wrong theme.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>(getInitialTheme)

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(STORAGE_KEY, next)
    window.location.reload()
  }, [theme])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
