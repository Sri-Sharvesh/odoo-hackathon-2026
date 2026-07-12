import { VehicleStatus } from '@/types/enums'
import type { ListParams, Paginated } from '@/types/common'
import type { CreateVehicleInput, UpdateVehicleInput, Vehicle } from '@/types/vehicle'
import type { VehicleService } from '../vehicleService'
import { ApiError } from '../api/errors'
import { mockDelay } from './mockUtils'

const seedTimestamp = '2026-01-15T09:00:00.000Z'

let vehicles: Vehicle[] = [
  seed('veh_001', 'VAN-05', 'Ford Transit', 'van', 500, 34_210, 28_000, VehicleStatus.Available),
  seed('veh_002', 'TRK-1042', 'Volvo FH16', 'truck', 12_000, 128_450, 145_000, VehicleStatus.OnTrip),
  seed('veh_003', 'TRK-1108', 'Scania R450', 'truck', 10_000, 98_230, 132_000, VehicleStatus.InShop),
  seed('veh_004', 'PU-2209', 'Toyota Hilux', 'pickup', 1_000, 45_012, 32_000, VehicleStatus.Available),
  seed('veh_005', 'VAN-11', 'Mercedes Sprinter', 'van', 800, 61_230, 34_500, VehicleStatus.OnTrip),
  seed('veh_006', 'TRL-3301', 'Great Dane Trailer', 'trailer', 20_000, 15_230, 21_000, VehicleStatus.Available),
  seed('veh_007', 'BUS-4501', 'Volvo 9700', 'bus', 3_000, 210_430, 220_000, VehicleStatus.Retired),
  seed('veh_008', 'TRK-1230', 'MAN TGX', 'truck', 11_000, 76_210, 138_000, VehicleStatus.Available),
  seed('veh_009', 'PU-2277', 'Ford Ranger', 'pickup', 950, 23_110, 29_500, VehicleStatus.InShop),
  seed('veh_010', 'VAN-19', 'Renault Master', 'van', 850, 51_200, 31_000, VehicleStatus.OnTrip),
  seed('veh_011', 'TRK-1305', 'Iveco Stralis', 'truck', 9_500, 112_400, 129_000, VehicleStatus.Available),
  seed('veh_012', 'TRL-3355', 'Wabash Trailer', 'trailer', 18_000, 8_100, 19_500, VehicleStatus.Available),
  seed('veh_013', 'BUS-4520', 'Mercedes Tourismo', 'bus', 2_800, 154_200, 205_000, VehicleStatus.Available),
]

function seed(
  id: string,
  registrationNumber: string,
  model: string,
  type: string,
  maxLoadCapacityKg: number,
  odometerKm: number,
  acquisitionCost: number,
  status: VehicleStatus,
): Vehicle {
  return {
    id,
    registrationNumber,
    model,
    type,
    maxLoadCapacityKg,
    odometerKm,
    acquisitionCost,
    status,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  }
}

function matchesFilters(vehicle: Vehicle, params?: ListParams): boolean {
  if (!params) return true
  if (params.search) {
    const term = params.search.toLowerCase()
    const haystack = `${vehicle.registrationNumber} ${vehicle.model} ${vehicle.type}`.toLowerCase()
    if (!haystack.includes(term)) return false
  }
  if (params.filters?.status && vehicle.status !== params.filters.status) return false
  if (params.filters?.type && vehicle.type !== params.filters.type) return false
  return true
}

function duplicateRegistrationError(): ApiError {
  return new ApiError({
    message: 'Registration number already exists',
    status: 409,
    fieldErrors: { registrationNumber: 'This registration number is already in use.' },
  })
}

export const vehicleMock: VehicleService = {
  async list(params) {
    await mockDelay()
    const filtered = vehicles.filter((vehicle) => matchesFilters(vehicle, params))
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
    } satisfies Paginated<Vehicle>
  },

  async get(id) {
    await mockDelay(200)
    const vehicle = vehicles.find((v) => v.id === id)
    if (!vehicle) throw new ApiError({ message: 'Vehicle not found', status: 404 })
    return vehicle
  },

  async create(input: CreateVehicleInput) {
    await mockDelay()
    const isDuplicate = vehicles.some(
      (v) => v.registrationNumber.toLowerCase() === input.registrationNumber.toLowerCase(),
    )
    if (isDuplicate) throw duplicateRegistrationError()

    const now = new Date().toISOString()
    const vehicle: Vehicle = {
      id: crypto.randomUUID(),
      ...input,
      status: VehicleStatus.Available,
      createdAt: now,
      updatedAt: now,
    }
    vehicles = [vehicle, ...vehicles]
    return vehicle
  },

  async update(id, input: UpdateVehicleInput) {
    await mockDelay()
    const existing = vehicles.find((v) => v.id === id)
    if (!existing) throw new ApiError({ message: 'Vehicle not found', status: 404 })

    if (input.registrationNumber) {
      const isDuplicate = vehicles.some(
        (v) =>
          v.id !== id &&
          v.registrationNumber.toLowerCase() === input.registrationNumber?.toLowerCase(),
      )
      if (isDuplicate) throw duplicateRegistrationError()
    }

    const updated: Vehicle = { ...existing, ...input, updatedAt: new Date().toISOString() }
    vehicles = vehicles.map((v) => (v.id === id ? updated : v))
    return updated
  },

  async remove(id) {
    await mockDelay(250)
    vehicles = vehicles.filter((v) => v.id !== id)
  },
}
