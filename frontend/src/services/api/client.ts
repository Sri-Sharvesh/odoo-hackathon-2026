import axios from 'axios'
import { APP_CONFIG } from '@/constants/config'
import { normalizeError } from './errors'

/**
 * Pre-configured Axios instance shared by every service.
 * Interceptors centralise auth-token injection and error normalisation so no
 * component/service repeats that plumbing.
 */
export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
})

// Request: attach the bearer token when the user is authenticated.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(APP_CONFIG.authTokenKey)
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// Response: convert every failure into an `ApiError` before it reaches the UI.
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // TODO(auth): on a 401 the AuthContext should clear the session and redirect
    // to /login. Handled there (not here) so this module stays side-effect free.
    return Promise.reject(normalizeError(error))
  },
)
