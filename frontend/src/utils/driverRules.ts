import { DriverStatus } from '@/types/enums'
import type { Driver } from '@/types/driver'

/** True when the licence expiry date is in the past. */
export function isLicenseExpired(licenseExpiry: string, now: Date = new Date()): boolean {
  const expiry = new Date(licenseExpiry)
  if (Number.isNaN(expiry.getTime())) return false
  return expiry.getTime() < now.setHours(0, 0, 0, 0)
}

/**
 * Business rule: a driver is ineligible for dispatch if suspended, already on a trip,
 * or holding an expired licence. Reused by Trip assignment later.
 */
export function isDriverDispatchable(driver: Driver, now: Date = new Date()): boolean {
  if (driver.status === DriverStatus.Suspended || driver.status === DriverStatus.OnTrip) {
    return false
  }
  return !isLicenseExpired(driver.licenseExpiry, now)
}
