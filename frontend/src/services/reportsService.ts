/** Reports service. Aggregates vehicles/fuel/maintenance/trips into per-vehicle reports. */
import { APP_CONFIG } from '@/constants/config'
import type { VehicleReport } from '@/types/report'
import { apiClient } from './api/client'
import { reportsMock } from './mocks/reportsMock'

export interface ReportsService {
  getVehicleReports(): Promise<VehicleReport[]>
}

const realReportsService: ReportsService = {
  async getVehicleReports() {
    // TODO(api): GET /reports/vehicles -> VehicleReport[]
    const { data } = await apiClient.get<VehicleReport[]>('/reports/vehicles')
    return data
  },
}

export const reportsService: ReportsService = APP_CONFIG.useMocks
  ? reportsMock
  : realReportsService
