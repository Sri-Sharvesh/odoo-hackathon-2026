import { useContext } from 'react'
import { ThemeContext } from '@/contexts/theme-context'

/** Access the current theme + toggle. Throws if used outside `ThemeProvider`. */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
