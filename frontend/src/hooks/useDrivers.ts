import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { driverService } from '@/services/driverService'
import type { ListParams } from '@/types/common'
import type { CreateDriverInput, UpdateDriverInput } from '@/types/driver'

export function useDriversQuery(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.drivers.list(params),
    queryFn: () => driverService.list(params),
  })
}

export function useCreateDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateDriverInput) => driverService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all() })
    },
  })
}

export function useUpdateDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDriverInput }) =>
      driverService.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all() })
    },
  })
}

export function useDeleteDriver() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => driverService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all() })
    },
  })
}
