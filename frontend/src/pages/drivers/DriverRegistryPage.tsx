import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
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
import { DriverFormDialog } from '@/components/drivers/DriverFormDialog'
import { LICENSE_CATEGORY_OPTIONS } from '@/constants/licenseCategories'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useDeleteDriver, useDriversQuery } from '@/hooks/useDrivers'
import type { Driver } from '@/types/driver'
import { formatDate, formatNumber } from '@/utils/format'
import { driverStatusMeta } from '@/utils/statusPresentation'
import { isLicenseExpired } from '@/utils/driverRules'

const STATUS_FILTER_OPTIONS = [
  { label: 'All statuses', value: '' },
  ...Object.entries(driverStatusMeta).map(([value, meta]) => ({ label: meta.label, value })),
]

const CATEGORY_FILTER_OPTIONS = [
  { label: 'All categories', value: '' },
  ...LICENSE_CATEGORY_OPTIONS.map((o) => ({ label: o.value, value: o.value })),
]

const PAGE_SIZE = 8

interface FormDialogState {
  open: boolean
  driver?: Driver
}

export default function DriverRegistryPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [formDialog, setFormDialog] = useState<FormDialogState>({ open: false })
  const [pendingDelete, setPendingDelete] = useState<Driver | null>(null)

  const debouncedSearch = useDebouncedValue(search)
  const deleteDriver = useDeleteDriver()

  const params = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      filters: { status: status || undefined, category: category || undefined },
    }),
    [page, debouncedSearch, status, category],
  )

  const { data, isLoading, isError, refetch } = useDriversQuery(params)

  const columns: Array<Column<Driver>> = [
    {
      id: 'name',
      header: 'Name',
      sortable: true,
      sortAccessor: (row) => row.name,
      cell: (row) => <span className="font-medium text-foreground">{row.name}</span>,
    },
    {
      id: 'licenseNumber',
      header: 'License No.',
      sortable: true,
      sortAccessor: (row) => row.licenseNumber,
      cell: (row) => row.licenseNumber,
    },
    { id: 'licenseCategory', header: 'Category', cell: (row) => row.licenseCategory },
    {
      id: 'licenseExpiry',
      header: 'Expiry',
      sortable: true,
      sortAccessor: (row) => row.licenseExpiry,
      cell: (row) => (
        <span className="flex items-center gap-2">
          {formatDate(row.licenseExpiry)}
          {isLicenseExpired(row.licenseExpiry) && (
            <Badge intent="danger">Expired</Badge>
          )}
        </span>
      ),
    },
    { id: 'contactNumber', header: 'Contact', cell: (row) => row.contactNumber },
    {
      id: 'safetyScore',
      header: 'Safety',
      align: 'right',
      sortable: true,
      sortAccessor: (row) => row.safetyScore,
      cell: (row) => formatNumber(row.safetyScore),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const meta = driverStatusMeta[row.status]
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
            onClick={() => setFormDialog({ open: true, driver: row })}
            className="rounded-md p-1.5 text-foreground-muted hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(row)}
            className="rounded-md p-1.5 text-foreground-muted hover:bg-danger-surface hover:text-danger"
            aria-label={`Delete ${row.name}`}
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
          title="Driver Management"
          description="Manage drivers, licences, availability and safety scores."
        />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Driver Management"
        description="Manage drivers, licences, availability and safety scores."
        actions={
          <Button onClick={() => setFormDialog({ open: true })}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Driver
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
            placeholder="Search name, license, contact…"
            aria-label="Search drivers"
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
            <EmptyState
              title="No drivers found"
              description="Try adjusting your search or filters, or add a new driver."
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

      <DriverFormDialog
        open={formDialog.open}
        driver={formDialog.driver}
        onClose={() => setFormDialog({ open: false })}
      />

      <Dialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete driver"
        description={
          pendingDelete
            ? `This permanently removes ${pendingDelete.name} from the registry.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleteDriver.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteDriver.isPending}
              onClick={async () => {
                if (!pendingDelete) return
                await deleteDriver.mutateAsync(pendingDelete.id)
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
