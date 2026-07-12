/** Fuel log service. Same shape as vehicleService: real Axios impl + mock adapter. */
import { APP_CONFIG } from '@/constants/config'
import type { ListParams, Paginated } from '@/types/common'
import type { CreateFuelLogInput, FuelLog, UpdateFuelLogInput } from '@/types/fuelLog'
import { apiClient } from './api/client'
import { fuelLogMock } from './mocks/fuelLogMock'

export interface FuelLogService {
  list(params?: ListParams): Promise<Paginated<FuelLog>>
  create(input: CreateFuelLogInput): Promise<FuelLog>
  update(id: string, input: UpdateFuelLogInput): Promise<FuelLog>
  remove(id: string): Promise<void>
}

const realFuelLogService: FuelLogService = {
  async list(params) {
    // TODO(api): GET /fuel-logs?search=&vehicleId=&page=&pageSize= -> Paginated<FuelLog>
    const { data } = await apiClient.get<Paginated<FuelLog>>('/fuel-logs', { params })
    return data
  },
  async create(input) {
    // TODO(api): POST /fuel-logs -> FuelLog
    const { data } = await apiClient.post<FuelLog>('/fuel-logs', input)
    return data
  },
  async update(id, input) {
    // TODO(api): PATCH /fuel-logs/:id -> FuelLog
    const { data } = await apiClient.patch<FuelLog>(`/fuel-logs/${id}`, input)
    return data
  },
  async remove(id) {
    // TODO(api): DELETE /fuel-logs/:id
    await apiClient.delete(`/fuel-logs/${id}`)
  },
}

export const fuelLogService: FuelLogService = APP_CONFIG.useMocks
  ? fuelLogMock
  : realFuelLogService
