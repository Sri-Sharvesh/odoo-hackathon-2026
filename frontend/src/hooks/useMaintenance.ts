import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { maintenanceService } from '@/services/maintenanceService'
import type { ListParams } from '@/types/common'
import type { CreateMaintenanceInput } from '@/types/maintenance'

export function useMaintenanceQuery(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.maintenance.list(params),
    queryFn: () => maintenanceService.list(params),
  })
}

/** Create/close also mutate the linked vehicle's status, so invalidate both. */
function useInvalidateMaintenanceQueries() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all() })
    void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() })
  }
}

export function useCreateMaintenance() {
  const invalidate = useInvalidateMaintenanceQueries()
  return useMutation({
    mutationFn: (input: CreateMaintenanceInput) => maintenanceService.create(input),
    onSuccess: invalidate,
  })
}

export function useCloseMaintenance() {
  const invalidate = useInvalidateMaintenanceQueries()
  return useMutation({
    mutationFn: (id: string) => maintenanceService.close(id),
    onSuccess: invalidate,
  })
}

export function useDeleteMaintenance() {
  const invalidate = useInvalidateMaintenanceQueries()
  return useMutation({
    mutationFn: (id: string) => maintenanceService.remove(id),
    onSuccess: invalidate,
  })
}
