import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { reportsService } from '@/services/reportsService'

export function useVehicleReportsQuery() {
  return useQuery({
    queryKey: queryKeys.reports.vehicles(),
    queryFn: () => reportsService.getVehicleReports(),
  })
}
