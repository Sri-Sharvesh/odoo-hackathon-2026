import { createContext } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

/** Consumed via the `useTheme` hook; provided by `ThemeProvider`. */
export const ThemeContext = createContext<ThemeContextValue | null>(null)
