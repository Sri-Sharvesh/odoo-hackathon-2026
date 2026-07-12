import type { ListParams, Paginated } from '@/types/common'
import type { CreateFuelLogInput, FuelLog, UpdateFuelLogInput } from '@/types/fuelLog'
import type { FuelLogService } from '../fuelLogService'
import { ApiError } from '../api/errors'
import { mockDelay } from './mockUtils'

let logs: FuelLog[] = []

function matchesFilters(log: FuelLog, params?: ListParams): boolean {
  if (!params) return true
  if (params.filters?.vehicleId && log.vehicleId !== params.filters.vehicleId) return false
  return true
}

export const fuelLogMock: FuelLogService = {
  async list(params) {
    await mockDelay()
    const filtered = logs.filter((l) => matchesFilters(l, params))
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
    } satisfies Paginated<FuelLog>
  },

  async create(input: CreateFuelLogInput) {
    await mockDelay()
    const now = new Date().toISOString()
    const log: FuelLog = { id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now }
    logs = [log, ...logs]
    return log
  },

  async update(id, input: UpdateFuelLogInput) {
    await mockDelay()
    const existing = logs.find((l) => l.id === id)
    if (!existing) throw new ApiError({ message: 'Fuel log not found', status: 404 })
    const updated: FuelLog = { ...existing, ...input, updatedAt: new Date().toISOString() }
    logs = logs.map((l) => (l.id === id ? updated : l))
    return updated
  },

  async remove(id) {
    await mockDelay(250)
    logs = logs.filter((l) => l.id !== id)
  },
}
