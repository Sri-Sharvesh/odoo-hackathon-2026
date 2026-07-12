/**
 * Presentation formatters. Pure functions, no business logic — safe to reuse anywhere.
 * Locale/currency defaults live in `@/constants/config` so they can be changed centrally.
 */
import { APP_CONFIG } from '@/constants/config'

const nullDash = (value: unknown): value is null | undefined =>
  value === null || value === undefined

/** Currency, e.g. `$12,500.00`. Returns an em dash for missing values. */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = APP_CONFIG.currency,
): string {
  if (nullDash(value) || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(APP_CONFIG.locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

/** Plain number with grouping, e.g. `1,240`. */
export function formatNumber(
  value: number | null | undefined,
  fractionDigits = 0,
): string {
  if (nullDash(value) || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat(APP_CONFIG.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

/** Percentage from a 0–100 value, e.g. `72%`. */
export function formatPercent(
  value: number | null | undefined,
  fractionDigits = 0,
): string {
  if (nullDash(value) || Number.isNaN(value)) return '—'
  return `${formatNumber(value, fractionDigits)}%`
}

/** Distance in kilometres, e.g. `128 km`. */
export function formatDistanceKm(value: number | null | undefined): string {
  if (nullDash(value) || Number.isNaN(value)) return '—'
  return `${formatNumber(value)} km`
}

/** Speed in km/h, e.g. `64 km/h`. */
export function formatSpeed(value: number | null | undefined): string {
  if (nullDash(value) || Number.isNaN(value)) return '—'
  return `${formatNumber(value)} km/h`
}

const toDate = (value: string | number | Date): Date =>
  value instanceof Date ? value : new Date(value)

/** Date only, e.g. `12 Jul 2026`. */
export function formatDate(value: string | number | Date | null | undefined): string {
  if (nullDash(value)) return '—'
  return new Intl.DateTimeFormat(APP_CONFIG.locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(toDate(value))
}

/** Date + time, e.g. `12 Jul 2026, 14:30`. */
export function formatDateTime(
  value: string | number | Date | null | undefined,
): string {
  if (nullDash(value)) return '—'
  return new Intl.DateTimeFormat(APP_CONFIG.locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(toDate(value))
}

/** Human relative time, e.g. `3 min ago`, `in 2 days`. */
export function formatRelativeTime(
  value: string | number | Date | null | undefined,
): string {
  if (nullDash(value)) return '—'
  const target = toDate(value).getTime()
  const diffSeconds = Math.round((target - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat(APP_CONFIG.locale, { numeric: 'auto' })

  const divisions: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ]

  let duration = diffSeconds
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }
  return rtf.format(Math.round(duration), 'year')
}
