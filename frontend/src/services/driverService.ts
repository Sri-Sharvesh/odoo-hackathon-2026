/**
 * Driver Management service. Mirrors `vehicleService`: typed interface + real Axios
 * implementation + mock adapter, selected by `APP_CONFIG.useMocks`.
 */
import { APP_CONFIG } from '@/constants/config'
import type { ListParams, Paginated } from '@/types/common'
import type { CreateDriverInput, Driver, UpdateDriverInput } from '@/types/driver'
import { apiClient } from './api/client'
import { driverMock } from './mocks/driverMock'

export interface DriverService {
  list(params?: ListParams): Promise<Paginated<Driver>>
  get(id: string): Promise<Driver>
  create(input: CreateDriverInput): Promise<Driver>
  update(id: string, input: UpdateDriverInput): Promise<Driver>
  remove(id: string): Promise<void>
}

const realDriverService: DriverService = {
  async list(params) {
    // TODO(api): GET /drivers?search=&status=&page=&pageSize= -> Paginated<Driver>
    const { data } = await apiClient.get<Paginated<Driver>>('/drivers', { params })
    return data
  },
  async get(id) {
    // TODO(api): GET /drivers/:id -> Driver
    const { data } = await apiClient.get<Driver>(`/drivers/${id}`)
    return data
  },
  async create(input) {
    // TODO(api): POST /drivers -> Driver (409 + { errors: { licenseNumber } } when taken)
    const { data } = await apiClient.post<Driver>('/drivers', input)
    return data
  },
  async update(id, input) {
    // TODO(api): PATCH /drivers/:id -> Driver
    const { data } = await apiClient.patch<Driver>(`/drivers/${id}`, input)
    return data
  },
  async remove(id) {
    // TODO(api): DELETE /drivers/:id
    await apiClient.delete(`/drivers/${id}`)
  },
}

export const driverService: DriverService = APP_CONFIG.useMocks
  ? driverMock
  : realDriverService
