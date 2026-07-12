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
import { FuelLogFormDialog } from '@/components/fuel/FuelLogFormDialog'
import { useDeleteFuelLog, useFuelLogsQuery } from '@/hooks/useFuelLogs'
import { useVehiclesQuery } from '@/hooks/useVehicles'
import type { FuelLog } from '@/types/fuelLog'
import { formatCurrency, formatDate, formatNumber } from '@/utils/format'

const PAGE_SIZE = 8

interface FormDialogState {
  open: boolean
  fuelLog?: FuelLog
}

export default function FuelLogsPage() {
  const [vehicleId, setVehicleId] = useState('')
  const [page, setPage] = useState(1)
  const [formDialog, setFormDialog] = useState<FormDialogState>({ open: false })
  const [pendingDelete, setPendingDelete] = useState<FuelLog | null>(null)

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, filters: { vehicleId: vehicleId || undefined } }),
    [page, vehicleId],
  )

  const { data, isLoading, isError, refetch } = useFuelLogsQuery(params)
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

  const deleteFuelLog = useDeleteFuelLog()

  const columns: Array<Column<FuelLog>> = [
    {
      id: 'vehicleId',
      header: 'Vehicle',
      cell: (row) => (
        <span className="font-medium text-slate-900">
          {vehicleById.get(row.vehicleId)?.registrationNumber ?? '—'}
        </span>
      ),
    },
    { id: 'date', header: 'Date', sortable: true, sortAccessor: (row) => row.date, cell: (row) => formatDate(row.date) },
    { id: 'liters', header: 'Liters', align: 'right', cell: (row) => formatNumber(row.liters) },
    { id: 'cost', header: 'Cost', align: 'right', cell: (row) => formatCurrency(row.cost) },
    { id: 'notes', header: 'Notes', cell: (row) => row.notes || '—' },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: '96px',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setFormDialog({ open: true, fuelLog: row })}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Edit fuel log"
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-danger-surface hover:text-danger"
            aria-label="Delete fuel log"
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
        <PageHeader title="Fuel Logs" description="Record fuel purchases and monitor consumption." />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fuel Logs"
        description="Record fuel purchases and monitor consumption."
        actions={
          <Button onClick={() => setFormDialog({ open: true })}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Fuel Log
          </Button>
        }
      />

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

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyState={
          <div className="p-8">
            <EmptyState title="No fuel logs" description="Add a fuel log to start tracking consumption." />
          </div>
        }
        footer={
          data && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.meta.total} onPageChange={setPage} />
          )
        }
      />

      <FuelLogFormDialog
        open={formDialog.open}
        fuelLog={formDialog.fuelLog}
        vehicles={vehicles}
        onClose={() => setFormDialog({ open: false })}
      />

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete fuel log"
        description="This permanently removes the fuel log entry."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleteFuelLog.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteFuelLog.isPending}
              onClick={async () => {
                if (!pendingDelete) return
                await deleteFuelLog.mutateAsync(pendingDelete.id)
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
