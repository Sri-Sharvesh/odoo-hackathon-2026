/** Expense service. Same shape as vehicleService: real Axios impl + mock adapter. */
import { APP_CONFIG } from '@/constants/config'
import type { ListParams, Paginated } from '@/types/common'
import type { CreateExpenseInput, Expense, UpdateExpenseInput } from '@/types/expense'
import { apiClient } from './api/client'
import { expenseMock } from './mocks/expenseMock'

export interface ExpenseService {
  list(params?: ListParams): Promise<Paginated<Expense>>
  create(input: CreateExpenseInput): Promise<Expense>
  update(id: string, input: UpdateExpenseInput): Promise<Expense>
  remove(id: string): Promise<void>
}

const realExpenseService: ExpenseService = {
  async list(params) {
    // TODO(api): GET /expenses?search=&vehicleId=&category=&page=&pageSize= -> Paginated<Expense>
    const { data } = await apiClient.get<Paginated<Expense>>('/expenses', { params })
    return data
  },
  async create(input) {
    // TODO(api): POST /expenses -> Expense
    const { data } = await apiClient.post<Expense>('/expenses', input)
    return data
  },
  async update(id, input) {
    // TODO(api): PATCH /expenses/:id -> Expense
    const { data } = await apiClient.patch<Expense>(`/expenses/${id}`, input)
    return data
  },
  async remove(id) {
    // TODO(api): DELETE /expenses/:id
    await apiClient.delete(`/expenses/${id}`)
  },
}

export const expenseService: ExpenseService = APP_CONFIG.useMocks
  ? expenseMock
  : realExpenseService
