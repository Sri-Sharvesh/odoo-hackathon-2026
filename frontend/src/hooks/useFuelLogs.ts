import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { fuelLogService } from '@/services/fuelLogService'
import type { ListParams } from '@/types/common'
import type { CreateFuelLogInput, UpdateFuelLogInput } from '@/types/fuelLog'

export function useFuelLogsQuery(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.fuelLogs.list(params),
    queryFn: () => fuelLogService.list(params),
  })
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateFuelLogInput) => fuelLogService.create(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.fuelLogs.all() }),
  })
}

export function useUpdateFuelLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFuelLogInput }) =>
      fuelLogService.update(id, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.fuelLogs.all() }),
  })
}

export function useDeleteFuelLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fuelLogService.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.fuelLogs.all() }),
  })
}
