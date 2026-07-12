import { createContext } from 'react'
import type { User } from '@/types/auth'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  /** True while an existing session is being restored on first load. */
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

/** Consumed via the `useAuth` hook; provided by `AuthProvider`. */
export const AuthContext = createContext<AuthContextValue | null>(null)
