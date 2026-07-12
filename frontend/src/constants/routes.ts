/**
 * Canonical route paths. Reference these instead of hard-coding URL strings so
 * links and the router never drift apart.
 */
export const ROUTES = {
  login: '/login',
  dashboard: '/',
  fleetTracking: '/tracking',
  vehicles: '/vehicles',
  drivers: '/drivers',
  trips: '/trips',
  maintenance: '/maintenance',
  fuel: '/fuel',
  expenses: '/expenses',
  reports: '/reports',
  analytics: '/analytics',
  roles: '/roles',
  settings: '/settings',
  profile: '/profile',
} as const

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]
