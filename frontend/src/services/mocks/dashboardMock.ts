import { driverService } from '@/services/driverService'
import { tripService } from '@/services/tripService'
import { vehicleService } from '@/services/vehicleService'
import type { DashboardFilters, DashboardSummary } from '@/types/dashboard'
import { DriverStatus, TripStatus, VehicleStatus } from '@/types/enums'
import type { DashboardService } from '../dashboardService'
import { mockDelay } from './mockUtils'

export const dashboardMock: DashboardService = {
  async getSummary(filters?: DashboardFilters) {
    await mockDelay()
    const [{ data: vehicles }, { data: drivers }, { data: trips }] = await Promise.all([
      vehicleService.list({ pageSize: 1000 }),
      driverService.list({ pageSize: 1000 }),
      tripService.list({ pageSize: 1000 }),
    ])

    const filteredVehicles = vehicles.filter(
      (v) =>
        (!filters?.type || v.type === filters.type) &&
        (!filters?.status || v.status === filters.status),
    )

    const activeVehicles = filteredVehicles.filter((v) => v.status !== VehicleStatus.Retired).length
    const onTripVehicles = filteredVehicles.filter((v) => v.status === VehicleStatus.OnTrip).length

    const summary: DashboardSummary = {
      activeVehicles,
      availableVehicles: filteredVehicles.filter((v) => v.status === VehicleStatus.Available).length,
      vehiclesInMaintenance: filteredVehicles.filter((v) => v.status === VehicleStatus.InShop).length,
      activeTrips: trips.filter((t) => t.status === TripStatus.Dispatched).length,
      pendingTrips: trips.filter((t) => t.status === TripStatus.Draft).length,
      driversOnDuty: drivers.filter(
        (d) => d.status === DriverStatus.Available || d.status === DriverStatus.OnTrip,
      ).length,
      fleetUtilization: activeVehicles > 0 ? Math.round((onTripVehicles / activeVehicles) * 100) : 0,
    }
    return summary
  },
}
