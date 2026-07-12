import { fuelLogService } from '@/services/fuelLogService'
import { maintenanceService } from '@/services/maintenanceService'
import { tripService } from '@/services/tripService'
import { vehicleService } from '@/services/vehicleService'
import { TripStatus } from '@/types/enums'
import type { VehicleReport } from '@/types/report'
import type { ReportsService } from '../reportsService'
import { mockDelay } from './mockUtils'

export const reportsMock: ReportsService = {
  async getVehicleReports() {
    await mockDelay()
    const [{ data: vehicles }, { data: fuelLogs }, { data: maintenanceRecords }, { data: trips }] =
      await Promise.all([
        vehicleService.list({ pageSize: 1000 }),
        fuelLogService.list({ pageSize: 1000 }),
        maintenanceService.list({ pageSize: 1000 }),
        tripService.list({ pageSize: 1000 }),
      ])

    return vehicles.map((vehicle): VehicleReport => {
      const vehicleFuelLogs = fuelLogs.filter((f) => f.vehicleId === vehicle.id)
      const totalFuelLiters = vehicleFuelLogs.reduce((sum, f) => sum + f.liters, 0)
      const totalFuelCost = vehicleFuelLogs.reduce((sum, f) => sum + f.cost, 0)

      const totalMaintenanceCost = maintenanceRecords
        .filter((m) => m.vehicleId === vehicle.id)
        .reduce((sum, m) => sum + m.cost, 0)

      const totalDistanceKm = trips
        .filter((t) => t.vehicleId === vehicle.id && t.status === TripStatus.Completed)
        .reduce((sum, t) => sum + t.plannedDistanceKm, 0)

      return {
        vehicleId: vehicle.id,
        registrationNumber: vehicle.registrationNumber,
        model: vehicle.model,
        totalDistanceKm,
        totalFuelLiters,
        fuelEfficiencyKmPerLiter: totalFuelLiters > 0 ? totalDistanceKm / totalFuelLiters : null,
        operationalCost: totalFuelCost + totalMaintenanceCost,
        // Revenue isn't captured anywhere in the current data model (no fare/invoice
        // entity), so ROI can't be computed yet — surfaced as null rather than guessed.
        roi: null,
      }
    })
  },
}
