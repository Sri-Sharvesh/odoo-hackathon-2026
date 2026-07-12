/** Dashboard summary service. Aggregates vehicles/drivers/trips into fleet-wide KPIs. */
import { APP_CONFIG } from '@/constants/config'
import type { DashboardFilters, DashboardSummary } from '@/types/dashboard'
import { apiClient } from './api/client'
import { dashboardMock } from './mocks/dashboardMock'

export interface DashboardService {
  getSummary(filters?: DashboardFilters): Promise<DashboardSummary>
}

const realDashboardService: DashboardService = {
  async getSummary(filters) {
    // TODO(api): GET /dashboard/summary?type=&status= -> DashboardSummary
    const { data } = await apiClient.get<DashboardSummary>('/dashboard/summary', {
      params: filters,
    })
    return data
  },
}

export const dashboardService: DashboardService = APP_CONFIG.useMocks
  ? dashboardMock
  : realDashboardService
