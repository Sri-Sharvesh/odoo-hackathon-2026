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
import { CompleteTripDialog } from '@/components/trips/CompleteTripDialog'
import { TripFormDialog } from '@/components/trips/TripFormDialog'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDriversQuery } from '@/hooks/useDrivers'
import { useCancelTrip, useDeleteTrip, useDispatchTrip, useTripsQuery } from '@/hooks/useTrips'
import { useVehiclesQuery } from '@/hooks/useVehicles'
import { TripStatus } from '@/types/enums'
import type { Trip } from '@/types/trip'
import { formatDistanceKm, formatNumber } from '@/utils/format'
import { tripStatusMeta } from '@/utils/statusPresentation'

const STATUS_FILTER_OPTIONS = [
  { label: 'All statuses', value: '' },
  ...Object.entries(tripStatusMeta).map(([value, meta]) => ({ label: meta.label, value })),
]

const PAGE_SIZE = 8

export default function TripsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Trip | null>(null)

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

  const { data, isLoading, isError, refetch } = useTripsQuery(params)
  const { data: vehiclesData } = useVehiclesQuery({ pageSize: 1000 })
  const { data: driversData } = useDriversQuery({ pageSize: 1000 })

  const vehicles = useMemo(() => vehiclesData?.data ?? [], [vehiclesData])
  const drivers = useMemo(() => driversData?.data ?? [], [driversData])
  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles])
  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers])

  const dispatchTrip = useDispatchTrip()
  const cancelTrip = useCancelTrip()
  const deleteTrip = useDeleteTrip()

  const columns: Array<Column<Trip>> = [
    {
      id: 'route',
      header: 'Route',
      cell: (row) => (
        <span className="font-medium text-slate-900">
          {row.source} → {row.destination}
        </span>
      ),
    },
    {
      id: 'vehicleId',
      header: 'Vehicle',
      cell: (row) => vehicleById.get(row.vehicleId)?.registrationNumber ?? '—',
    },
    {
      id: 'driverId',
      header: 'Driver',
      cell: (row) => driverById.get(row.driverId)?.name ?? '—',
    },
    {
      id: 'cargoWeightKg',
      header: 'Cargo',
      align: 'right',
      cell: (row) => `${formatNumber(row.cargoWeightKg)} kg`,
    },
    {
      id: 'plannedDistanceKm',
      header: 'Distance',
      align: 'right',
      cell: (row) => formatDistanceKm(row.plannedDistanceKm),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const meta = tripStatusMeta[row.status]
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
      width: '220px',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === TripStatus.Draft && (
            <>
              <Button size="sm" onClick={() => dispatchTrip.mutate(row.id)}>
                Dispatch
              </Button>
              <Button size="sm" variant="outline" onClick={() => cancelTrip.mutate(row.id)}>
                Cancel
              </Button>
            </>
          )}
          {row.status === TripStatus.Dispatched && (
            <>
              <Button size="sm" onClick={() => setCompletingTrip(row)}>
                Complete
              </Button>
              <Button size="sm" variant="outline" onClick={() => cancelTrip.mutate(row.id)}>
                Cancel
              </Button>
            </>
          )}
          {(row.status === TripStatus.Completed || row.status === TripStatus.Cancelled) && (
            <button
              type="button"
              onClick={() => setPendingDelete(row)}
              className="rounded-md p-1.5 text-slate-500 hover:bg-danger-surface hover:text-danger"
              aria-label={`Delete trip ${row.source} to ${row.destination}`}
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
        <PageHeader title="Trip Management" description="Create, dispatch and monitor trips across the fleet." />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip Management"
        description="Create, dispatch and monitor trips across the fleet."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Create Trip
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
            placeholder="Search source, destination…"
            aria-label="Search trips"
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
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyState={
          <div className="p-8">
            <EmptyState
              title="No trips found"
              description="Try adjusting your search or filters, or create a new trip."
            />
          </div>
        }
        footer={
          data && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.meta.total} onPageChange={setPage} />
          )
        }
      />

      <TripFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        vehicles={vehicles}
        drivers={drivers}
      />

      <CompleteTripDialog trip={completingTrip} onClose={() => setCompletingTrip(null)} />

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete trip"
        description={
          pendingDelete ? `This permanently removes the ${pendingDelete.source} → ${pendingDelete.destination} trip.` : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={deleteTrip.isPending}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteTrip.isPending}
              onClick={async () => {
                if (!pendingDelete) return
                await deleteTrip.mutateAsync(pendingDelete.id)
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
