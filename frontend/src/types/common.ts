/** Shared, domain-agnostic types used across every module and service. */

export type ID = string

/** ISO-8601 timestamp string, as returned by the backend. */
export type ISODateString = string

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: string
  direction: SortDirection
}

/** Query parameters accepted by list endpoints. Services translate these to the API. */
export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDir?: SortDirection
  /** Module-specific status/type filters, resolved by each service. */
  filters?: Record<string, string | number | boolean | undefined>
}

export interface PageMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/** Standard envelope for paginated list responses. */
export interface Paginated<T> {
  data: T[]
  meta: PageMeta
}

/** Generic select/dropdown option. */
export interface Option<T extends string = string> {
  label: string
  value: T
  disabled?: boolean
  /** Optional reason shown when an option is disabled by a business rule. */
  disabledReason?: string
}
