/**
 * Authentication service.
 *
 * The exemplar for the whole service layer: a typed interface, a real Axios-backed
 * implementation, and a mock adapter. `APP_CONFIG.useMocks` decides which is exported.
 * Backend integration = flip the env flag; UI/hooks import `authService` and never change.
 */
import { APP_CONFIG } from '@/constants/config'
import type { AuthSession, LoginCredentials, User } from '@/types/auth'
import { apiClient } from './api/client'
import { authMock } from './mocks/authMock'

export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthSession>
  logout(): Promise<void>
  getCurrentUser(): Promise<User>
}

/** Real implementation. Endpoints below are the expected backend contract. */
const realAuthService: AuthService = {
  async login(credentials) {
    // TODO(api): POST /auth/login  body: { email, password }  -> { user, token }
    const { data } = await apiClient.post<AuthSession>('/auth/login', credentials)
    return data
  },
  async logout() {
    // TODO(api): POST /auth/logout
    await apiClient.post('/auth/logout')
  },
  async getCurrentUser() {
    // TODO(api): GET /auth/me  -> User
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },
}

export const authService: AuthService = APP_CONFIG.useMocks
  ? authMock
  : realAuthService
