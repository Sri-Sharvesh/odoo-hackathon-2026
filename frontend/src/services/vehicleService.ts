/**
 * Vehicle Registry service. Same shape as `authService`: a typed interface, a real
 * Axios implementation, and a mock adapter, selected by `APP_CONFIG.useMocks`.
 */
import { APP_CONFIG } from '@/constants/config'
import type { ListParams, Paginated } from '@/types/common'
import type { CreateVehicleInput, UpdateVehicleInput, Vehicle } from '@/types/vehicle'
import { apiClient } from './api/client'
import { vehicleMock } from './mocks/vehicleMock'

export interface VehicleService {
  list(params?: ListParams): Promise<Paginated<Vehicle>>
  get(id: string): Promise<Vehicle>
  create(input: CreateVehicleInput): Promise<Vehicle>
  update(id: string, input: UpdateVehicleInput): Promise<Vehicle>
  remove(id: string): Promise<void>
}

const realVehicleService: VehicleService = {
  async list(params) {
    // TODO(api): GET /vehicles?search=&status=&type=&page=&pageSize= -> Paginated<Vehicle>
    const { data } = await apiClient.get<Paginated<Vehicle>>('/vehicles', { params })
    return data
  },
  async get(id) {
    // TODO(api): GET /vehicles/:id -> Vehicle
    const { data } = await apiClient.get<Vehicle>(`/vehicles/${id}`)
    return data
  },
  async create(input) {
    // TODO(api): POST /vehicles -> Vehicle
    // Expected 409 + { errors: { registrationNumber: '...' } } when the number is taken.
    const { data } = await apiClient.post<Vehicle>('/vehicles', input)
    return data
  },
  async update(id, input) {
    // TODO(api): PATCH /vehicles/:id -> Vehicle
    const { data } = await apiClient.patch<Vehicle>(`/vehicles/${id}`, input)
    return data
  },
  async remove(id) {
    // TODO(api): DELETE /vehicles/:id
    await apiClient.delete(`/vehicles/${id}`)
  },
}

export const vehicleService: VehicleService = APP_CONFIG.useMocks
  ? vehicleMock
  : realVehicleService
