import { vehicleService } from '@/services/vehicleService'
import type { ListParams, Paginated } from '@/types/common'
import { MaintenanceStatus, VehicleStatus } from '@/types/enums'
import type { CreateMaintenanceInput, MaintenanceRecord } from '@/types/maintenance'
import type { MaintenanceService } from '../maintenanceService'
import { ApiError } from '../api/errors'
import { mockDelay } from './mockUtils'

let records: MaintenanceRecord[] = []

function matchesFilters(record: MaintenanceRecord, params?: ListParams): boolean {
  if (!params) return true
  if (params.search) {
    const term = params.search.toLowerCase()
    if (!record.description.toLowerCase().includes(term)) return false
  }
  if (params.filters?.status && record.status !== params.filters.status) return false
  return true
}

export const maintenanceMock: MaintenanceService = {
  async list(params) {
    await mockDelay()
    const filtered = records.filter((r) => matchesFilters(r, params))
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? (filtered.length || 1)
    const start = (page - 1) * pageSize
    return {
      data: filtered.slice(start, start + pageSize),
      meta: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
      },
    } satisfies Paginated<MaintenanceRecord>
  },

  async create(input: CreateMaintenanceInput) {
    await mockDelay()
    const { data: vehicles } = await vehicleService.list({ pageSize: 1000 })
    const vehicle = vehicles.find((v) => v.id === input.vehicleId)
    if (!vehicle) throw new ApiError({ message: 'Vehicle not found', status: 404 })
    if (vehicle.status !== VehicleStatus.Available) {
      throw new ApiError({
        message: 'Vehicle is not available for maintenance',
        status: 409,
        fieldErrors: { vehicleId: 'This vehicle is not available for maintenance.' },
      })
    }

    await vehicleService.update(input.vehicleId, { status: VehicleStatus.InShop })

    const now = new Date().toISOString()
    const record: MaintenanceRecord = {
      id: crypto.randomUUID(),
      ...input,
      status: MaintenanceStatus.Open,
      createdAt: now,
      updatedAt: now,
    }
    records = [record, ...records]
    return record
  },

  async close(id) {
    await mockDelay()
    const record = records.find((r) => r.id === id)
    if (!record) throw new ApiError({ message: 'Maintenance record not found', status: 404 })
    if (record.status !== MaintenanceStatus.Open) {
      throw new ApiError({ message: 'Only open records can be closed', status: 409 })
    }

    await vehicleService.update(record.vehicleId, { status: VehicleStatus.Available })

    const updated: MaintenanceRecord = {
      ...record,
      status: MaintenanceStatus.Closed,
      updatedAt: new Date().toISOString(),
    }
    records = records.map((r) => (r.id === id ? updated : r))
    return updated
  },

  async remove(id) {
    await mockDelay(250)
    records = records.filter((r) => r.id !== id)
  },
}
