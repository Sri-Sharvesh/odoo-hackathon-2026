export interface DashboardSummary {
  activeVehicles: number
  availableVehicles: number
  vehiclesInMaintenance: number
  activeTrips: number
  pendingTrips: number
  driversOnDuty: number
  /** Percentage (0-100) of active vehicles currently on a trip. */
  fleetUtilization: number
}

export interface DashboardFilters {
  type?: string
  status?: string
}
