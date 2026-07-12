import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { EXPENSE_CATEGORY_OPTIONS } from '@/constants/expenseCategories'
import { useCreateExpense, useUpdateExpense } from '@/hooks/useExpenses'
import { ApiError } from '@/services/api/errors'
import type { Option } from '@/types/common'
import type { Expense } from '@/types/expense'
import type { Vehicle } from '@/types/vehicle'

const expenseFormSchema = z.object({
  vehicleId: z.string().min(1, 'Select a vehicle'),
  category: z.string().min(1, 'Select a category'),
  amount: z.coerce
    .number()
    .refine((v) => !Number.isNaN(v), { message: 'Enter a valid number' })
    .min(0, 'Cannot be negative'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
})

type ExpenseFormInput = z.input<typeof expenseFormSchema>
type ExpenseFormOutput = z.output<typeof expenseFormSchema>

const emptyValues: ExpenseFormInput = {
  vehicleId: '',
  category: '',
  amount: 0,
  date: '',
  description: '',
}

function vehicleOptions(vehicles: Vehicle[]): Option[] {
  return vehicles.map((v) => ({ label: `${v.registrationNumber} — ${v.model}`, value: v.id }))
}

export interface ExpenseFormDialogProps {
  open: boolean
  onClose: () => void
  vehicles: Vehicle[]
  expense?: Expense
}

export function ExpenseFormDialog({ open, onClose, vehicles, expense }: ExpenseFormDialogProps) {
  const isEditing = Boolean(expense)
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const isSaving = createExpense.isPending || updateExpense.isPending

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ExpenseFormInput, unknown, ExpenseFormOutput>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(
      expense
        ? {
            vehicleId: expense.vehicleId,
            category: expense.category,
            amount: expense.amount,
            date: expense.date,
            description: expense.description ?? '',
          }
        : emptyValues,
    )
  }, [open, expense, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (isEditing && expense) {
        await updateExpense.mutateAsync({ id: expense.id, input: values })
      } else {
        await createExpense.mutateAsync(values)
      }
      onClose()
    } catch (error) {
      if (error instanceof ApiError && error.fieldErrors) {
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          setError(field as keyof ExpenseFormInput, { message })
        }
        return
      }
      setError('root', {
        message: error instanceof Error ? error.message : 'Unable to save expense.',
      })
    }
  })

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Expense' : 'Add Expense'}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="expense-form" isLoading={isSaving}>
            {isEditing ? 'Save changes' : 'Add expense'}
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <Select
          label="Vehicle"
          required
          placeholder="Select a vehicle"
          options={vehicleOptions(vehicles)}
          error={errors.vehicleId?.message}
          {...register('vehicleId')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            required
            placeholder="Select category"
            options={EXPENSE_CATEGORY_OPTIONS}
            error={errors.category?.message}
            {...register('category')}
          />
          <Input
            label="Amount ($)"
            type="number"
            required
            error={errors.amount?.message}
            {...register('amount')}
          />
        </div>
        <Input label="Date" type="date" required error={errors.date?.message} {...register('date')} />
        <Input label="Description (optional)" {...register('description')} />
        {errors.root?.message && (
          <p role="alert" className="rounded-md bg-danger-surface px-3 py-2 text-sm text-danger">
            {errors.root.message}
          </p>
        )}
      </form>
    </Dialog>
  )
}
