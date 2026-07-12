import type { ID, ISODateString } from './common'
import type { TripStatus } from './enums'

export interface Trip {
  id: ID
  source: string
  destination: string
  vehicleId: ID
  driverId: ID
  cargoWeightKg: number
  plannedDistanceKm: number
  status: TripStatus
  finalOdometerKm?: number
  fuelConsumedLiters?: number
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface TripFormValues {
  source: string
  destination: string
  vehicleId: string
  driverId: string
  cargoWeightKg: number
  plannedDistanceKm: number
}

export type CreateTripInput = TripFormValues

export interface CompleteTripInput {
  finalOdometerKm: number
  fuelConsumedLiters: number
}
