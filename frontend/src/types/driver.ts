import type { ID, ISODateString } from './common'
import type { DriverStatus } from './enums'

export interface Driver {
  id: ID
  name: string
  /** Must be unique across drivers (enforced by the service). */
  licenseNumber: string
  licenseCategory: string
  /** ISO date (YYYY-MM-DD) of licence expiry. */
  licenseExpiry: ISODateString
  contactNumber: string
  /** 0–100 safety rating. */
  safetyScore: number
  status: DriverStatus
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface DriverFormValues {
  name: string
  licenseNumber: string
  licenseCategory: string
  licenseExpiry: string
  contactNumber: string
  safetyScore: number
}

export type CreateDriverInput = DriverFormValues
export type UpdateDriverInput = Partial<DriverFormValues> & { status?: DriverStatus }
