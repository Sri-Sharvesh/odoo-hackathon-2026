import type { ID, ISODateString } from './common'

export interface Expense {
  id: ID
  vehicleId: ID
  category: string
  amount: number
  date: ISODateString
  description?: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface ExpenseFormValues {
  vehicleId: string
  category: string
  amount: number
  date: string
  description?: string
}

export type CreateExpenseInput = ExpenseFormValues
export type UpdateExpenseInput = Partial<ExpenseFormValues>
