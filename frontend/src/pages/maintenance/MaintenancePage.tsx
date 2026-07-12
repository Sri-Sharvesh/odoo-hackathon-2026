import { Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import type { Column } from '@/components/data/DataTable'
import { DataTable } from '@/components/data/DataTable'
import { Pagination } from '@/components/data/Pagination'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Select } from '@/components/ui/Select'
import { MaintenanceFormDialog } from '@/components/maintenance/MaintenanceFormDialog'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useCloseMaintenance, useDeleteMaintenance, useMaintenanceQuery } from '@/hooks/useMaintenance'
import { useVehiclesQuery } from '@/hooks/useVehicles'
import { MaintenanceStatus } from '@/types/enums'
import type { MaintenanceRecord } from '@/types/maintenance'
import { formatCurrency, formatDate } from '@/utils/format'
import { maintenanceStatusMeta } from '@/utils/statusPresentation'

const STATUS_FILTER_OPTIONS = [
  { label: 'All statuses', value: '' },
  ...Object.entries(maintenanceStatusMeta).map(([value, meta]) => ({ label: meta.label, value })),
]

const PAGE_SIZE = 8

export default function MaintenancePage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<MaintenanceRecord | null>(null)

  const debouncedSearch = useDebouncedValue(search)

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      filters: { status: status || undefined },
    }),
    [page, debouncedSearch, status],
  )

  const { data, isLoading, isError, refetch } = useMaintenanceQuery(params)
  const { data: vehiclesData } = useVehiclesQuery({ pageSize: 1000 })
  const vehicles = useMemo(() => vehiclesData?.data ?? [], [vehiclesData])
  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles])

  const closeMaintenance = useCloseMaintenance()
  const deleteMaintenance = useDeleteMaintenance()

  const columns: Array<Column<MaintenanceRecord>> = [
    {
      id: 'vehicleId',
      header: 'Vehicle',
      cell: (row) => (
        <span className="font-medium text-foreground">
          {vehicleById.get(row.vehicleId)?.registrationNumber ?? '—'}
        </span>
      ),
    },
    { id: 'description', header: 'Description', cell: (row) => row.description },
    { id: 'cost', header: 'Cost', align: 'right', cell: (row) => formatCurrency(row.cost) },
    {
      id: 'scheduledDate',
      header: 'Scheduled Date',
      cell: (row) => formatDate(row.scheduledDate),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const meta = maintenanceStatusMeta[row.status]
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
      width: '140px',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === MaintenanceStatus.Open && (
            <Button size="sm" onClick={() => closeMaintenance.mutate(row.id)}>
              Close
            </Button>
          )}
          {row.status === MaintenanceStatus.Closed && (
            <button
              type="button"
              onClick={() => setPendingDelete(row)}
              className="rounded-md p-1.5 text-foreground-muted hover:bg-danger-surface hover:text-danger"
              aria-label={`Delete maintenance record for ${row.description}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      ),
    },
  ]

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Maintenance" description="Schedule and track service, repairs and inspections." />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="Schedule and track service, repairs and inspections."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Create Record
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search description…"
            aria-label="Search maintenance records"
            className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyState={
          <div className="p-8">
            <EmptyState
              title="No maintenance records"
              description="Try adjusting your filters, or create a new record."
            />
          </div>
        }
        footer={
          data && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.meta.total} onPageChange={setPage} />
          )
        }
      />

      <MaintenanceFormDialog open={createOpen} onClose={() => setCreateOpen(false)} vehicles={vehicles} />

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete maintenance record"
        description={
          pendingDelete ? `This permanently removes the "${pendingDelete.description}" record.` : undefined
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleteMaintenance.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMaintenance.isPending}
              onClick={async () => {
                if (!pendingDelete) return
                await deleteMaintenance.mutateAsync(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground-muted">Are you sure? This action cannot be undone.</p>
      </Dialog>
    </div>
  )
}
