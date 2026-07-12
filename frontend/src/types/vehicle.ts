import type { ID, ISODateString } from './common'
import type { VehicleStatus } from './enums'

export interface Vehicle {
  id: ID
  /** Must be unique across the fleet (enforced by the service). */
  registrationNumber: string
  model: string
  /** Vehicle category, e.g. 'truck' | 'van' — see VEHICLE_TYPE_OPTIONS. */
  type: string
  maxLoadCapacityKg: number
  odometerKm: number
  acquisitionCost: number
  status: VehicleStatus
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface VehicleFormValues {
  registrationNumber: string
  model: string
  type: string
  maxLoadCapacityKg: number
  odometerKm: number
  acquisitionCost: number
}

export type CreateVehicleInput = VehicleFormValues
export type UpdateVehicleInput = Partial<VehicleFormValues> & { status?: VehicleStatus }
