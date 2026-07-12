import { driverService } from '@/services/driverService'
import { vehicleService } from '@/services/vehicleService'
import { DriverStatus, TripStatus, VehicleStatus } from '@/types/enums'
import type { ListParams, Paginated } from '@/types/common'
import type { CompleteTripInput, CreateTripInput, Trip } from '@/types/trip'
import { isDriverDispatchable } from '@/utils/driverRules'
import type { TripService } from '../tripService'
import { ApiError } from '../api/errors'
import { mockDelay } from './mockUtils'

let trips: Trip[] = []

function matchesFilters(trip: Trip, params?: ListParams): boolean {
  if (!params) return true
  if (params.search) {
    const term = params.search.toLowerCase()
    const haystack = `${trip.source} ${trip.destination}`.toLowerCase()
    if (!haystack.includes(term)) return false
  }
  if (params.filters?.status && trip.status !== params.filters.status) return false
  return true
}

function notFound(): ApiError {
  return new ApiError({ message: 'Trip not found', status: 404 })
}

async function findVehicleOrThrow(vehicleId: string) {
  const { data } = await vehicleService.list({ pageSize: 1000 })
  const vehicle = data.find((v) => v.id === vehicleId)
  if (!vehicle) throw new ApiError({ message: 'Vehicle not found', status: 404 })
  return vehicle
}

async function findDriverOrThrow(driverId: string) {
  const { data } = await driverService.list({ pageSize: 1000 })
  const driver = data.find((d) => d.id === driverId)
  if (!driver) throw new ApiError({ message: 'Driver not found', status: 404 })
  return driver
}

export const tripMock: TripService = {
  async list(params) {
    await mockDelay()
    const filtered = trips.filter((trip) => matchesFilters(trip, params))
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
    } satisfies Paginated<Trip>
  },

  async create(input: CreateTripInput) {
    await mockDelay()
    const vehicle = await findVehicleOrThrow(input.vehicleId)
    const driver = await findDriverOrThrow(input.driverId)

    if (vehicle.status !== VehicleStatus.Available) {
      throw new ApiError({
        message: 'Vehicle is not available',
        status: 409,
        fieldErrors: { vehicleId: 'This vehicle is no longer available.' },
      })
    }
    if (!isDriverDispatchable(driver)) {
      throw new ApiError({
        message: 'Driver is not available',
        status: 409,
        fieldErrors: { driverId: 'This driver is no longer available.' },
      })
    }
    if (input.cargoWeightKg > vehicle.maxLoadCapacityKg) {
      throw new ApiError({
        message: 'Cargo exceeds vehicle capacity',
        status: 422,
        fieldErrors: {
          cargoWeightKg: `Cannot exceed ${vehicle.maxLoadCapacityKg} kg for this vehicle.`,
        },
      })
    }

    const now = new Date().toISOString()
    const trip: Trip = {
      id: crypto.randomUUID(),
      ...input,
      status: TripStatus.Draft,
      createdAt: now,
      updatedAt: now,
    }
    trips = [trip, ...trips]
    return trip
  },

  async dispatch(id) {
    await mockDelay()
    const trip = trips.find((t) => t.id === id)
    if (!trip) throw notFound()
    if (trip.status !== TripStatus.Draft) {
      throw new ApiError({ message: 'Only draft trips can be dispatched', status: 409 })
    }
    const vehicle = await findVehicleOrThrow(trip.vehicleId)
    const driver = await findDriverOrThrow(trip.driverId)
    if (vehicle.status !== VehicleStatus.Available || !isDriverDispatchable(driver)) {
      throw new ApiError({ message: 'Vehicle or driver is no longer available', status: 409 })
    }

    await vehicleService.update(trip.vehicleId, { status: VehicleStatus.OnTrip })
    await driverService.update(trip.driverId, { status: DriverStatus.OnTrip })

    const updated: Trip = { ...trip, status: TripStatus.Dispatched, updatedAt: new Date().toISOString() }
    trips = trips.map((t) => (t.id === id ? updated : t))
    return updated
  },

  async complete(id, input: CompleteTripInput) {
    await mockDelay()
    const trip = trips.find((t) => t.id === id)
    if (!trip) throw notFound()
    if (trip.status !== TripStatus.Dispatched) {
      throw new ApiError({ message: 'Only dispatched trips can be completed', status: 409 })
    }

    await vehicleService.update(trip.vehicleId, {
      status: VehicleStatus.Available,
      odometerKm: input.finalOdometerKm,
    })
    await driverService.update(trip.driverId, { status: DriverStatus.Available })

    const updated: Trip = {
      ...trip,
      ...input,
      status: TripStatus.Completed,
      updatedAt: new Date().toISOString(),
    }
    trips = trips.map((t) => (t.id === id ? updated : t))
    return updated
  },

  async cancel(id) {
    await mockDelay()
    const trip = trips.find((t) => t.id === id)
    if (!trip) throw notFound()
    if (trip.status !== TripStatus.Draft && trip.status !== TripStatus.Dispatched) {
      throw new ApiError({ message: 'Only draft or dispatched trips can be cancelled', status: 409 })
    }

    if (trip.status === TripStatus.Dispatched) {
      await vehicleService.update(trip.vehicleId, { status: VehicleStatus.Available })
      await driverService.update(trip.driverId, { status: DriverStatus.Available })
    }

    const updated: Trip = { ...trip, status: TripStatus.Cancelled, updatedAt: new Date().toISOString() }
    trips = trips.map((t) => (t.id === id ? updated : t))
    return updated
  },

  async remove(id) {
    await mockDelay(250)
    trips = trips.filter((t) => t.id !== id)
  },
}
