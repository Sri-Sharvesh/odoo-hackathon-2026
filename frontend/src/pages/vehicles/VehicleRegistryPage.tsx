import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Column } from '@/components/data/DataTable'
import { DataTable } from '@/components/data/DataTable'
import { Pagination } from '@/components/data/Pagination'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Select } from '@/components/ui/Select'
import { VehicleFormDialog } from '@/components/vehicles/VehicleFormDialog'
import { VEHICLE_TYPE_OPTIONS } from '@/constants/vehicleTypes'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeleteVehicle, useVehiclesQuery } from '@/hooks/useVehicles'
import type { Vehicle } from '@/types/vehicle'
import { formatCurrency, formatDistanceKm, formatNumber } from '@/utils/format'
import { vehicleStatusMeta } from '@/utils/statusPresentation'

const STATUS_FILTER_OPTIONS = [
  { label: 'All statuses', value: '' },
  ...Object.entries(vehicleStatusMeta).map(([value, meta]) => ({ label: meta.label, value })),
]

const TYPE_FILTER_OPTIONS = [{ label: 'All types', value: '' }, ...VEHICLE_TYPE_OPTIONS]

const PAGE_SIZE = 8

interface FormDialogState {
  open: boolean
  vehicle?: Vehicle
}

export default function VehicleRegistryPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [formDialog, setFormDialog] = useState<FormDialogState>({ open: false })
  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null)

  const debouncedSearch = useDebouncedValue(search)
  const deleteVehicle = useDeleteVehicle()

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      filters: { status: status || undefined, type: type || undefined },
    }),
    [page, debouncedSearch, status, type],
  )

  const { data, isLoading, isError, refetch } = useVehiclesQuery(params)

  const columns: Array<Column<Vehicle>> = [
    {
      id: 'registrationNumber',
      header: 'Registration No.',
      sortable: true,
      sortAccessor: (row) => row.registrationNumber,
      cell: (row) => <span className="font-medium text-slate-900">{row.registrationNumber}</span>,
    },
    {
      id: 'model',
      header: 'Model',
      sortable: true,
      sortAccessor: (row) => row.model,
      cell: (row) => row.model,
    },
    {
      id: 'type',
      header: 'Type',
      cell: (row) => <span className="capitalize">{row.type}</span>,
    },
    {
      id: 'maxLoadCapacityKg',
      header: 'Max Capacity',
      align: 'right',
      sortable: true,
      sortAccessor: (row) => row.maxLoadCapacityKg,
      cell: (row) => `${formatNumber(row.maxLoadCapacityKg)} kg`,
    },
    {
      id: 'odometerKm',
      header: 'Odometer',
      align: 'right',
      sortable: true,
      sortAccessor: (row) => row.odometerKm,
      cell: (row) => formatDistanceKm(row.odometerKm),
    },
    {
      id: 'acquisitionCost',
      header: 'Acquisition Cost',
      align: 'right',
      sortable: true,
      sortAccessor: (row) => row.acquisitionCost,
      cell: (row) => formatCurrency(row.acquisitionCost),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const meta = vehicleStatusMeta[row.status]
        return (
          <Badge intent={meta.intent} dot>
            {meta.label}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: '96px',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setFormDialog({ open: true, vehicle: row })}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Edit ${row.registrationNumber}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-danger-surface hover:text-danger"
            aria-label={`Delete ${row.registrationNumber}`}
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
        <PageHeader
          title="Vehicle Registry"
          description="Register and manage every vehicle in the fleet."
        />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehicle Registry"
        description="Register and manage every vehicle in the fleet."
        actions={
          <Button onClick={() => setFormDialog({ open: true })}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Vehicle
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search registration, model…"
            aria-label="Search vehicles"
            className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <Select
          aria-label="Filter by status"
          className="sm:w-44"
          options={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
        />
        <Select
          aria-label="Filter by type"
          className="sm:w-44"
          options={TYPE_FILTER_OPTIONS}
          value={type}
          onChange={(event) => {
            setType(event.target.value)
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
            <EmptyState
              title="No vehicles found"
              description="Try adjusting your search or filters, or add a new vehicle."
            />
          </div>
        }
        footer={
          data && (
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={data.meta.total}
              onPageChange={setPage}
            />
          )
        }
      />

      <VehicleFormDialog
        open={formDialog.open}
        vehicle={formDialog.vehicle}
        onClose={() => setFormDialog({ open: false })}
      />

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete vehicle"
        description={
          pendingDelete
            ? `This permanently removes ${pendingDelete.registrationNumber} from the registry.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleteVehicle.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteVehicle.isPending}
              onClick={async () => {
                if (!pendingDelete) return
                await deleteVehicle.mutateAsync(pendingDelete.id)
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
