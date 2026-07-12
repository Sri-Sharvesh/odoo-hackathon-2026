/**
 * Trip Management service. Same shape as vehicle/driver services, plus lifecycle
 * actions (dispatch/complete/cancel) that also transition the linked vehicle+driver.
 */
import { APP_CONFIG } from '@/constants/config'
import type { ListParams, Paginated } from '@/types/common'
import type { CompleteTripInput, CreateTripInput, Trip } from '@/types/trip'
import { apiClient } from './api/client'
import { tripMock } from './mocks/tripMock'

export interface TripService {
  list(params?: ListParams): Promise<Paginated<Trip>>
  create(input: CreateTripInput): Promise<Trip>
  dispatch(id: string): Promise<Trip>
  complete(id: string, input: CompleteTripInput): Promise<Trip>
  cancel(id: string): Promise<Trip>
  remove(id: string): Promise<void>
}

const realTripService: TripService = {
  async list(params) {
    // TODO(api): GET /trips?search=&status=&page=&pageSize= -> Paginated<Trip>
    const { data } = await apiClient.get<Paginated<Trip>>('/trips', { params })
    return data
  },
  async create(input) {
    // TODO(api): POST /trips -> Trip (Draft). 422 on cargo>capacity, 409 on unavailable vehicle/driver.
    const { data } = await apiClient.post<Trip>('/trips', input)
    return data
  },
  async dispatch(id) {
    // TODO(api): POST /trips/:id/dispatch -> Trip (sets vehicle+driver On Trip)
    const { data } = await apiClient.post<Trip>(`/trips/${id}/dispatch`)
    return data
  },
  async complete(id, input) {
    // TODO(api): POST /trips/:id/complete -> Trip (restores vehicle+driver, updates odometer)
    const { data } = await apiClient.post<Trip>(`/trips/${id}/complete`, input)
    return data
  },
  async cancel(id) {
    // TODO(api): POST /trips/:id/cancel -> Trip (restores vehicle+driver if was Dispatched)
    const { data } = await apiClient.post<Trip>(`/trips/${id}/cancel`)
    return data
  },
  async remove(id) {
    // TODO(api): DELETE /trips/:id
    await apiClient.delete(`/trips/${id}`)
  },
}

export const tripService: TripService = APP_CONFIG.useMocks ? tripMock : realTripService
