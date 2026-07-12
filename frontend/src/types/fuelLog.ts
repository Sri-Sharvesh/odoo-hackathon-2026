import type { ID, ISODateString } from './common'

export interface FuelLog {
  id: ID
  vehicleId: ID
  liters: number
  cost: number
  date: ISODateString
  notes?: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface FuelLogFormValues {
  vehicleId: string
  liters: number
  cost: number
  date: string
  notes?: string
}

export type CreateFuelLogInput = FuelLogFormValues
export type UpdateFuelLogInput = Partial<FuelLogFormValues>
