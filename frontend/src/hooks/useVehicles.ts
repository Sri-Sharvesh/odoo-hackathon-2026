import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { vehicleService } from '@/services/vehicleService'
import type { ListParams } from '@/types/common'
import type { CreateVehicleInput, UpdateVehicleInput } from '@/types/vehicle'

export function useVehiclesQuery(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.vehicles.list(params),
    queryFn: () => vehicleService.list(params),
  })
}

export function useCreateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateVehicleInput) => vehicleService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() })
    },
  })
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVehicleInput }) =>
      vehicleService.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() })
    },
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => vehicleService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() })
    },
  })
}
