/**
 * Business status vocabularies — values match the TransitOps spec exactly, since the
 * mandatory business rules key off them.
 *
 * Modelled as `as const` objects + derived unions rather than TS `enum` — the build
 * runs `erasableSyntaxOnly`, and this pattern is fully type-erasable while still giving
 * named constants. Keep the string values aligned with the backend's API contract.
 */

export const VehicleStatus = {
  Available: 'available',
  OnTrip: 'on_trip',
  InShop: 'in_shop',
  Retired: 'retired',
} as const
export type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus]

export const DriverStatus = {
  Available: 'available',
  OnTrip: 'on_trip',
  OffDuty: 'off_duty',
  Suspended: 'suspended',
} as const
export type DriverStatus = (typeof DriverStatus)[keyof typeof DriverStatus]

export const TripStatus = {
  Draft: 'draft',
  Dispatched: 'dispatched',
  Completed: 'completed',
  Cancelled: 'cancelled',
} as const
export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus]

/** A maintenance log is either active (Open ⇒ vehicle In Shop) or Closed. */
export const MaintenanceStatus = {
  Open: 'open',
  Closed: 'closed',
} as const
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus]

/** Visual intent shared by badges, banners and status dots. */
export type StatusIntent = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
