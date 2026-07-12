/**
 * Centralised React Query cache keys. Using one factory keeps keys consistent and
 * makes targeted invalidation trivial (e.g. `queryClient.invalidateQueries({ queryKey: queryKeys.vehicles.all() })`).
 */
import type { ListParams } from '@/types/common'

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  dashboard: {
    summary: () => ['dashboard', 'summary'] as const,
  },
  vehicles: {
    all: () => ['vehicles'] as const,
    list: (params?: ListParams) => ['vehicles', 'list', params ?? {}] as const,
    detail: (id: string) => ['vehicles', 'detail', id] as const,
  },
  drivers: {
    all: () => ['drivers'] as const,
    list: (params?: ListParams) => ['drivers', 'list', params ?? {}] as const,
    detail: (id: string) => ['drivers', 'detail', id] as const,
  },
  trips: {
    all: () => ['trips'] as const,
    list: (params?: ListParams) => ['trips', 'list', params ?? {}] as const,
    detail: (id: string) => ['trips', 'detail', id] as const,
  },
  maintenance: {
    all: () => ['maintenance'] as const,
    list: (params?: ListParams) => ['maintenance', 'list', params ?? {}] as const,
  },
  tracking: {
    liveVehicles: () => ['tracking', 'live'] as const,
    route: (vehicleId: string) => ['tracking', 'route', vehicleId] as const,
  },
} as const
