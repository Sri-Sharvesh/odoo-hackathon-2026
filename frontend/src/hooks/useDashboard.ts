import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { dashboardService } from '@/services/dashboardService'
import type { DashboardFilters } from '@/types/dashboard'

export function useDashboardSummaryQuery(filters?: DashboardFilters) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(filters),
    queryFn: () => dashboardService.getSummary(filters),
  })
}
