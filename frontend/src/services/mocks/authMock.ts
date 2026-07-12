import type { AuthService } from '../authService'
import type { AuthSession, LoginCredentials, User } from '@/types/auth'
import { mockDelay } from './mockUtils'

const demoUser: User = {
  id: 'usr_001',
  name: 'Alex Morgan',
  email: 'manager@transitops.dev',
  role: 'fleet_manager',
}

/**
 * In-memory auth adapter. Accepts any credentials and returns a demo session so the
 * app is usable end-to-end without a backend. Swap for `realAuthService` via env flag.
 */
export const authMock: AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    await mockDelay()
    const email = credentials.email || demoUser.email
    return {
      user: { ...demoUser, email },
      token: `mock.${btoa(email)}.${Date.now()}`,
    }
  },
  async logout(): Promise<void> {
    await mockDelay(150)
  },
  async getCurrentUser(): Promise<User> {
    await mockDelay(200)
    return demoUser
  },
}
