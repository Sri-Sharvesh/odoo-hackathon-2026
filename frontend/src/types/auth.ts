import type { ID } from './common'

// The four RBAC roles defined by the TransitOps spec.
export type UserRole =
  | 'fleet_manager'
  | 'driver'
  | 'safety_officer'
  | 'financial_analyst'

export interface User {
  id: ID
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

/** Returned by the auth service on successful login. */
export interface AuthSession {
  user: User
  token: string
}
