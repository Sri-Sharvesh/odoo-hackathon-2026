/**
 * Maps business status values to display metadata (label + visual intent).
 * Centralised so a status is styled/labelled identically everywhere (tables, badges)
 * and components stay free of status-to-colour logic.
 */
import {
  DriverStatus,
  MaintenanceStatus,
  TripStatus,
  VehicleStatus,
  type StatusIntent,
} from '@/types/enums'

export interface StatusMeta {
  label: string
  intent: StatusIntent
}

export const vehicleStatusMeta: Record<VehicleStatus, StatusMeta> = {
  [VehicleStatus.Available]: { label: 'Available', intent: 'success' },
  [VehicleStatus.OnTrip]: { label: 'On Trip', intent: 'info' },
  [VehicleStatus.InShop]: { label: 'In Shop', intent: 'warning' },
  [VehicleStatus.Retired]: { label: 'Retired', intent: 'neutral' },
}

export const driverStatusMeta: Record<DriverStatus, StatusMeta> = {
  [DriverStatus.Available]: { label: 'Available', intent: 'success' },
  [DriverStatus.OnTrip]: { label: 'On Trip', intent: 'info' },
  [DriverStatus.OffDuty]: { label: 'Off Duty', intent: 'neutral' },
  [DriverStatus.Suspended]: { label: 'Suspended', intent: 'danger' },
}

export const tripStatusMeta: Record<TripStatus, StatusMeta> = {
  [TripStatus.Draft]: { label: 'Draft', intent: 'neutral' },
  [TripStatus.Dispatched]: { label: 'Dispatched', intent: 'info' },
  [TripStatus.Completed]: { label: 'Completed', intent: 'success' },
  [TripStatus.Cancelled]: { label: 'Cancelled', intent: 'danger' },
}

export const maintenanceStatusMeta: Record<MaintenanceStatus, StatusMeta> = {
  [MaintenanceStatus.Open]: { label: 'Open', intent: 'warning' },
  [MaintenanceStatus.Closed]: { label: 'Closed', intent: 'success' },
}
