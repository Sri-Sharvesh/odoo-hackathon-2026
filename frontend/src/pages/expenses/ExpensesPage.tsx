import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import type { Column } from '@/components/data/DataTable'
import { DataTable } from '@/components/data/DataTable'
import { Pagination } from '@/components/data/Pagination'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Select } from '@/components/ui/Select'
import { ExpenseFormDialog } from '@/components/expenses/ExpenseFormDialog'
import { EXPENSE_CATEGORY_OPTIONS } from '@/constants/expenseCategories'
import { useDeleteExpense, useExpensesQuery } from '@/hooks/useExpenses'
import { useVehiclesQuery } from '@/hooks/useVehicles'
import type { Expense } from '@/types/expense'
import { formatCurrency, formatDate } from '@/utils/format'

const PAGE_SIZE = 8

const CATEGORY_FILTER_OPTIONS = [{ label: 'All categories', value: '' }, ...EXPENSE_CATEGORY_OPTIONS]

interface FormDialogState {
  open: boolean
  expense?: Expense
}

export default function ExpensesPage() {
  const [vehicleId, setVehicleId] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [formDialog, setFormDialog] = useState<FormDialogState>({ open: false })
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null)

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      filters: { vehicleId: vehicleId || undefined, category: category || undefined },
    }),
    [page, vehicleId, category],
  )

  const { data, isLoading, isError, refetch } = useExpensesQuery(params)
  const { data: vehiclesData } = useVehiclesQuery({ pageSize: 1000 })
  const vehicles = useMemo(() => vehiclesData?.data ?? [], [vehiclesData])
  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles])
  const vehicleFilterOptions = useMemo(
    () => [
      { label: 'All vehicles', value: '' },
      ...vehicles.map((v) => ({ label: v.registrationNumber, value: v.id })),
    ],
    [vehicles],
  )

  const deleteExpense = useDeleteExpense()

  const columns: Array<Column<Expense>> = [
    {
      id: 'vehicleId',
      header: 'Vehicle',
      cell: (row) => (
        <span className="font-medium text-slate-900">
          {vehicleById.get(row.vehicleId)?.registrationNumber ?? '—'}
        </span>
      ),
    },
    { id: 'category', header: 'Category', cell: (row) => <span className="capitalize">{row.category}</span> },
    { id: 'date', header: 'Date', sortable: true, sortAccessor: (row) => row.date, cell: (row) => formatDate(row.date) },
    { id: 'amount', header: 'Amount', align: 'right', cell: (row) => formatCurrency(row.amount) },
    { id: 'description', header: 'Description', cell: (row) => row.description || '—' },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: '96px',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setFormDialog({ open: true, expense: row })}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Edit expense"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-danger-surface hover:text-danger"
            aria-label="Delete expense"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Expenses" description="Capture and categorise operational expenses." />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Capture and categorise operational expenses."
        actions={
          <Button onClick={() => setFormDialog({ open: true })}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Expense
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          aria-label="Filter by vehicle"
          className="sm:w-56"
          options={vehicleFilterOptions}
          value={vehicleId}
          onChange={(event) => {
            setVehicleId(event.target.value)
            setPage(1)
          }}
        />
        <Select
          aria-label="Filter by category"
          className="sm:w-44"
          options={CATEGORY_FILTER_OPTIONS}
          value={category}
          onChange={(event) => {
            setCategory(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyState={
          <div className="p-8">
            <EmptyState title="No expenses" description="Add an expense to start tracking costs." />
          </div>
        }
        footer={
          data && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.meta.total} onPageChange={setPage} />
          )
        }
      />

      <ExpenseFormDialog
        open={formDialog.open}
        expense={formDialog.expense}
        vehicles={vehicles}
        onClose={() => setFormDialog({ open: false })}
      />

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete expense"
        description="This permanently removes the expense entry."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleteExpense.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteExpense.isPending}
              onClick={async () => {
                if (!pendingDelete) return
                await deleteExpense.mutateAsync(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Are you sure? This action cannot be undone.</p>
      </Dialog>
    </div>
  )
}
