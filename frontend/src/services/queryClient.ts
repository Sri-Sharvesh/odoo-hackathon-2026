import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api/errors'

/**
 * App-wide React Query client. Sensible enterprise defaults: don't spam the API on
 * window focus, keep data briefly fresh, and never retry client-side (4xx) errors.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status && error.status < 500) {
          return false
        }
        return failureCount < 2
      },
    },
  },
})
