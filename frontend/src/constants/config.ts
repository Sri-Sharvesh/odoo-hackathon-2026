/**
 * Typed application configuration, derived once from Vite env vars.
 * Import from here instead of reading `import.meta.env` directly, so env access
 * is validated and mockable in one place.
 */
const parseBool = (value: string | undefined, fallback: boolean): boolean =>
  value === undefined ? fallback : value.toLowerCase() === 'true'

export const APP_CONFIG = {
  appName: 'TransitOps',
  appDescription: 'Smart Transport Operations',
  /** Backend REST base URL. The Axios client prepends this to every request path. */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
  /** When true, services resolve to in-memory mock adapters (no backend required). */
  useMocks: parseBool(import.meta.env.VITE_USE_MOCKS, false),
  /** Intl locale + currency used by all formatters. */
  locale: 'en-US',
  currency: 'USD',
  /** localStorage key under which the auth token is persisted. */
  authTokenKey: 'transitops.auth.token',
} as const

export type AppConfig = typeof APP_CONFIG
