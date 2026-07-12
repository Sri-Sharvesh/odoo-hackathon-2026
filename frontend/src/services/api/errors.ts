import { AxiosError } from 'axios'

export interface ApiErrorShape {
  message: string
  status?: number
  code?: string
  /** Field-level validation errors keyed by field name (for form mapping). */
  fieldErrors?: Record<string, string>
}

/**
 * The single error type the UI deals with. Every service rejects with an `ApiError`,
 * so components/hooks never need to know about Axios internals.
 */
export class ApiError extends Error {
  readonly status?: number
  readonly code?: string
  readonly fieldErrors?: Record<string, string>

  constructor(shape: ApiErrorShape) {
    super(shape.message)
    this.name = 'ApiError'
    this.status = shape.status
    this.code = shape.code
    this.fieldErrors = shape.fieldErrors
  }
}

/** Convert anything thrown by Axios (or elsewhere) into a predictable `ApiError`. */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data as
      | { message?: string; code?: string; errors?: Record<string, string> }
      | undefined
    return new ApiError({
      message: data?.message ?? error.message ?? 'Request failed',
      status,
      code: data?.code,
      fieldErrors: data?.errors,
    })
  }

  if (error instanceof Error) return new ApiError({ message: error.message })
  return new ApiError({ message: 'An unexpected error occurred' })
}
