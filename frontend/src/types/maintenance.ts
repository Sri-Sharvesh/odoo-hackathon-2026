import type { ID, ISODateString } from './common'
import type { MaintenanceStatus } from './enums'

export interface MaintenanceRecord {
  id: ID
  vehicleId: ID
  description: string
  cost: number
  scheduledDate: ISODateString
  status: MaintenanceStatus
  notes?: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface CreateMaintenanceInput {
  vehicleId: string
  description: string
  cost: number
  scheduledDate: string
  notes?: string
}
