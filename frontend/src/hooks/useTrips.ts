import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { tripService } from '@/services/tripService'
import type { ListParams } from '@/types/common'
import type { CompleteTripInput, CreateTripInput } from '@/types/trip'

export function useTripsQuery(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.trips.list(params),
    queryFn: () => tripService.list(params),
  })
}

/** Dispatch/complete/cancel also mutate vehicle+driver status, so invalidate all three. */
function useInvalidateFleetQueries() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.trips.all() })
    void queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() })
    void queryClient.invalidateQueries({ queryKey: queryKeys.drivers.all() })
  }
}

export function useCreateTrip() {
  const invalidate = useInvalidateFleetQueries()
  return useMutation({
    mutationFn: (input: CreateTripInput) => tripService.create(input),
    onSuccess: invalidate,
  })
}

export function useDispatchTrip() {
  const invalidate = useInvalidateFleetQueries()
  return useMutation({
    mutationFn: (id: string) => tripService.dispatch(id),
    onSuccess: invalidate,
  })
}

export function useCompleteTrip() {
  const invalidate = useInvalidateFleetQueries()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompleteTripInput }) =>
      tripService.complete(id, input),
    onSuccess: invalidate,
  })
}

export function useCancelTrip() {
  const invalidate = useInvalidateFleetQueries()
  return useMutation({
    mutationFn: (id: string) => tripService.cancel(id),
    onSuccess: invalidate,
  })
}

export function useDeleteTrip() {
  const invalidate = useInvalidateFleetQueries()
  return useMutation({
    mutationFn: (id: string) => tripService.remove(id),
    onSuccess: invalidate,
  })
}
