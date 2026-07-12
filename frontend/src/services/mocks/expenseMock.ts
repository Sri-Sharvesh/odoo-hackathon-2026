import type { ListParams, Paginated } from '@/types/common'
import type { CreateExpenseInput, Expense, UpdateExpenseInput } from '@/types/expense'
import type { ExpenseService } from '../expenseService'
import { ApiError } from '../api/errors'
import { mockDelay } from './mockUtils'

let expenses: Expense[] = []

function matchesFilters(expense: Expense, params?: ListParams): boolean {
  if (!params) return true
  if (params.filters?.vehicleId && expense.vehicleId !== params.filters.vehicleId) return false
  if (params.filters?.category && expense.category !== params.filters.category) return false
  return true
}

export const expenseMock: ExpenseService = {
  async list(params) {
    await mockDelay()
    const filtered = expenses.filter((e) => matchesFilters(e, params))
    const page = params?.page ?? 1
    const pageSize = params?.pageSize ?? (filtered.length || 1)
    const start = (page - 1) * pageSize
    return {
      data: filtered.slice(start, start + pageSize),
      meta: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
      },
    } satisfies Paginated<Expense>
  },

  async create(input: CreateExpenseInput) {
    await mockDelay()
    const now = new Date().toISOString()
    const expense: Expense = { id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now }
    expenses = [expense, ...expenses]
    return expense
  },

  async update(id, input: UpdateExpenseInput) {
    await mockDelay()
    const existing = expenses.find((e) => e.id === id)
    if (!existing) throw new ApiError({ message: 'Expense not found', status: 404 })
    const updated: Expense = { ...existing, ...input, updatedAt: new Date().toISOString() }
    expenses = expenses.map((e) => (e.id === id ? updated : e))
    return updated
  },

  async remove(id) {
    await mockDelay(250)
    expenses = expenses.filter((e) => e.id !== id)
  },
}
