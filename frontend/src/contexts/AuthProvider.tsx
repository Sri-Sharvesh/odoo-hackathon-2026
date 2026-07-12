import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { APP_CONFIG } from '@/constants/config'
import { authService } from '@/services/authService'
import type { User } from '@/types/auth'
import { AuthContext, type AuthContextValue } from './auth-context'

/**
 * Owns session state: token persistence, restore-on-load, login and logout.
 * All auth I/O goes through `authService`, so this component is backend-agnostic.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Restore an existing session (if a token is persisted) exactly once on mount.
  useEffect(() => {
    const token = localStorage.getItem(APP_CONFIG.authTokenKey)
    if (!token) {
      setIsInitializing(false)
      return
    }

    let active = true
    authService
      .getCurrentUser()
      .then((restored) => {
        if (active) setUser(restored)
      })
      .catch(() => {
        localStorage.removeItem(APP_CONFIG.authTokenKey)
      })
      .finally(() => {
        if (active) setIsInitializing(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login({ email, password })
    localStorage.setItem(APP_CONFIG.authTokenKey, session.token)
    setUser(session.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem(APP_CONFIG.authTokenKey)
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isInitializing,
      login,
      logout,
    }),
    [user, isInitializing, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
