import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { expenseService } from '@/services/expenseService'
import type { ListParams } from '@/types/common'
import type { CreateExpenseInput, UpdateExpenseInput } from '@/types/expense'

export function useExpensesQuery(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.expenses.list(params),
    queryFn: () => expenseService.list(params),
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => expenseService.create(input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() }),
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExpenseInput }) =>
      expenseService.update(id, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() }),
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => expenseService.remove(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all() }),
  })
}
