import { DriverStatus } from '@/types/enums'
import type { ListParams, Paginated } from '@/types/common'
import type { CreateDriverInput, Driver, UpdateDriverInput } from '@/types/driver'
import type { DriverService } from '../driverService'
import { ApiError } from '../api/errors'
import { mockDelay } from './mockUtils'

const seedTimestamp = '2026-01-15T09:00:00.000Z'

let drivers: Driver[] = [
  seed('drv_001', 'Alex Morgan', 'DL-4501', 'HGV', '2028-06-30', '+1-202-555-0111', 92, DriverStatus.Available),
  seed('drv_002', 'Priya Nair', 'DL-4522', 'HMV', '2027-03-12', '+1-202-555-0142', 88, DriverStatus.OnTrip),
  seed('drv_003', 'Marcus Lee', 'DL-4530', 'LMV', '2025-11-01', '+1-202-555-0173', 74, DriverStatus.OffDuty),
  seed('drv_004', 'Sara Ahmed', 'DL-4548', 'PSV', '2029-01-20', '+1-202-555-0184', 95, DriverStatus.Available),
  seed('drv_005', 'Tom Becker', 'DL-4560', 'HGV', '2024-09-15', '+1-202-555-0195', 61, DriverStatus.Suspended),
  seed('drv_006', 'Lena Fischer', 'DL-4577', 'HMV', '2028-12-05', '+1-202-555-0206', 83, DriverStatus.Available),
  seed('drv_007', 'Diego Ramos', 'DL-4589', 'Trailer', '2027-07-22', '+1-202-555-0217', 79, DriverStatus.OnTrip),
  seed('drv_008', 'Grace Park', 'DL-4601', 'LMV', '2026-02-28', '+1-202-555-0228', 90, DriverStatus.Available),
  seed('drv_009', 'Omar Farah', 'DL-4610', 'HGV', '2025-05-10', '+1-202-555-0239', 68, DriverStatus.OffDuty),
  seed('drv_010', 'Nina Kovac', 'DL-4622', 'HMV', '2029-08-14', '+1-202-555-0240', 87, DriverStatus.Available),
  seed('drv_011', 'Ravi Patel', 'DL-4634', 'PSV', '2028-04-03', '+1-202-555-0251', 81, DriverStatus.OnTrip),
  seed('drv_012', 'Emma Wright', 'DL-4646', 'LMV', '2027-10-19', '+1-202-555-0262', 93, DriverStatus.Available),
]

function seed(
  id: string,
  name: string,
  licenseNumber: string,
  licenseCategory: string,
  licenseExpiry: string,
  contactNumber: string,
  safetyScore: number,
  status: DriverStatus,
): Driver {
  return {
    id,
    name,
    licenseNumber,
    licenseCategory,
    licenseExpiry,
    contactNumber,
    safetyScore,
    status,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  }
}

function matchesFilters(driver: Driver, params?: ListParams): boolean {
  if (!params) return true
  if (params.search) {
    const term = params.search.toLowerCase()
    const haystack = `${driver.name} ${driver.licenseNumber} ${driver.contactNumber}`.toLowerCase()
    if (!haystack.includes(term)) return false
  }
  if (params.filters?.status && driver.status !== params.filters.status) return false
  if (params.filters?.category && driver.licenseCategory !== params.filters.category) return false
  return true
}

function duplicateLicenseError(): ApiError {
  return new ApiError({
    message: 'License number already exists',
    status: 409,
    fieldErrors: { licenseNumber: 'This license number is already in use.' },
  })
}

export const driverMock: DriverService = {
  async list(params) {
    await mockDelay()
    const filtered = drivers.filter((driver) => matchesFilters(driver, params))
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
    } satisfies Paginated<Driver>
  },

  async get(id) {
    await mockDelay(200)
    const driver = drivers.find((d) => d.id === id)
    if (!driver) throw new ApiError({ message: 'Driver not found', status: 404 })
    return driver
  },

  async create(input: CreateDriverInput) {
    await mockDelay()
    const isDuplicate = drivers.some(
      (d) => d.licenseNumber.toLowerCase() === input.licenseNumber.toLowerCase(),
    )
    if (isDuplicate) throw duplicateLicenseError()

    const now = new Date().toISOString()
    const driver: Driver = {
      id: crypto.randomUUID(),
      ...input,
      status: DriverStatus.Available,
      createdAt: now,
      updatedAt: now,
    }
    drivers = [driver, ...drivers]
    return driver
  },

  async update(id, input: UpdateDriverInput) {
    await mockDelay()
    const existing = drivers.find((d) => d.id === id)
    if (!existing) throw new ApiError({ message: 'Driver not found', status: 404 })

    if (input.licenseNumber) {
      const isDuplicate = drivers.some(
        (d) =>
          d.id !== id &&
          d.licenseNumber.toLowerCase() === input.licenseNumber?.toLowerCase(),
      )
      if (isDuplicate) throw duplicateLicenseError()
    }

    const updated: Driver = { ...existing, ...input, updatedAt: new Date().toISOString() }
    drivers = drivers.map((d) => (d.id === id ? updated : d))
    return updated
  },

  async remove(id) {
    await mockDelay(250)
    drivers = drivers.filter((d) => d.id !== id)
  },
}
