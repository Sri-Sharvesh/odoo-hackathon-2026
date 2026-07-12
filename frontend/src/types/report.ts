export interface VehicleReport {
  vehicleId: string
  registrationNumber: string
  model: string
  totalDistanceKm: number
  totalFuelLiters: number
  /** km per liter; null when no fuel has been logged yet. */
  fuelEfficiencyKmPerLiter: number | null
  /** Fuel cost + maintenance cost, per the spec's operational-cost formula. */
  operationalCost: number
  /** (Revenue - (Maintenance + Fuel)) / Acquisition Cost; null until trip revenue is tracked. */
  roi: number | null
}
