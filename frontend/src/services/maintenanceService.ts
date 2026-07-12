/**
 * Maintenance service. Opening a record puts the vehicle In Shop (removed from
 * dispatch); closing it restores the vehicle to Available.
 */
import { APP_CONFIG } from '@/constants/config'
import type { ListParams, Paginated } from '@/types/common'
import type { CreateMaintenanceInput, MaintenanceRecord } from '@/types/maintenance'
import { apiClient } from './api/client'
import { maintenanceMock } from './mocks/maintenanceMock'

export interface MaintenanceService {
  list(params?: ListParams): Promise<Paginated<MaintenanceRecord>>
  create(input: CreateMaintenanceInput): Promise<MaintenanceRecord>
  close(id: string): Promise<MaintenanceRecord>
  remove(id: string): Promise<void>
}

const realMaintenanceService: MaintenanceService = {
  async list(params) {
    // TODO(api): GET /maintenance?search=&status=&page=&pageSize= -> Paginated<MaintenanceRecord>
    const { data } = await apiClient.get<Paginated<MaintenanceRecord>>('/maintenance', { params })
    return data
  },
  async create(input) {
    // TODO(api): POST /maintenance -> MaintenanceRecord (Open; sets vehicle In Shop). 409 if vehicle unavailable.
    const { data } = await apiClient.post<MaintenanceRecord>('/maintenance', input)
    return data
  },
  async close(id) {
    // TODO(api): POST /maintenance/:id/close -> MaintenanceRecord (restores vehicle to Available)
    const { data } = await apiClient.post<MaintenanceRecord>(`/maintenance/${id}/close`)
    return data
  },
  async remove(id) {
    // TODO(api): DELETE /maintenance/:id
    await apiClient.delete(`/maintenance/${id}`)
  },
}

export const maintenanceService: MaintenanceService = APP_CONFIG.useMocks
  ? maintenanceMock
  : realMaintenanceService
