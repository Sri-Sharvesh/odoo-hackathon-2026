import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { SortDirection, SortState } from '@/types/common'
import { cn } from '@/utils/cn'

export type ColumnAlign = 'left' | 'center' | 'right'

export interface Column<T> {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
  align?: ColumnAlign
  sortable?: boolean
  /** Value used for client-side sorting. Required for a column to sort locally. */
  sortAccessor?: (row: T) => string | number
  /** Fixed width, e.g. '160px' or '20%'. */
  width?: string
  headerClassName?: string
  cellClassName?: string
}

export interface DataTableProps<T> {
  columns: Array<Column<T>>
  data: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  emptyState?: ReactNode
  onRowClick?: (row: T) => void
  /**
   * Provide `sort` + `onSortChange` to control sorting externally (server-side).
   * Omit both to let the table sort its data client-side via `sortAccessor`.
   */
  sort?: SortState
  onSortChange?: (sort: SortState) => void
  skeletonRows?: number
  className?: string
  /** Rendered below the table, inside the same bordered container (e.g. pagination). */
  footer?: ReactNode
}

const alignClass: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

/**
 * Generic, accessible data grid. Fully presentational — it renders whatever rows and
 * column definitions it's given, so every module reuses it without duplicating table markup.
 */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  emptyState,
  onRowClick,
  sort,
  onSortChange,
  skeletonRows = 6,
  className,
  footer,
}: DataTableProps<T>) {
  const isControlledSort = sort !== undefined && onSortChange !== undefined
  const [internalSort, setInternalSort] = useState<SortState | null>(null)
  const activeSort = isControlledSort ? sort : internalSort

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return
    const nextDirection: SortDirection =
      activeSort?.field === column.id && activeSort.direction === 'asc' ? 'desc' : 'asc'
    const next: SortState = { field: column.id, direction: nextDirection }
    if (isControlledSort) onSortChange(next)
    else setInternalSort(next)
  }

  const sortedData = useMemo(() => {
    // With controlled sort the server already ordered the rows; render as received.
    if (isControlledSort || !activeSort) return data
    const column = columns.find((c) => c.id === activeSort.field)
    if (!column?.sortAccessor) return data
    const accessor = column.sortAccessor
    const factor = activeSort.direction === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const av = accessor(a)
      const bv = accessor(b)
      if (av < bv) return -factor
      if (av > bv) return factor
      return 0
    })
  }, [data, columns, activeSort, isControlledSort])

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-surface',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr className="border-b border-border">
              {columns.map((column) => {
                const isSorted = activeSort?.field === column.id
                const ariaSort = isSorted
                  ? activeSort.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : column.sortable
                    ? 'none'
                    : undefined
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={ariaSort}
                    style={column.width ? { width: column.width } : undefined}
                    className={cn(
                      'px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-foreground-muted',
                      alignClass[column.align ?? 'left'],
                      column.headerClassName,
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column)}
                        className={cn(
                          'inline-flex items-center gap-1 hover:text-foreground',
                          column.align === 'right' && 'flex-row-reverse',
                          column.align === 'center' && 'mx-auto',
                        )}
                      >
                        <span>{column.header}</span>
                        <SortIcon active={isSorted} direction={activeSort?.direction} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <tr
                  key={`skeleton-${rowIndex}`}
                  className="border-b border-border last:border-0"
                >
                  {columns.map((column) => (
                    <td key={column.id} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-32" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {emptyState ?? (
                    <div className="p-8">
                      <EmptyState
                        title="No records"
                        description="There is nothing to show here yet."
                      />
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-border transition-colors last:border-0',
                    onRowClick && 'cursor-pointer hover:bg-surface-hover',
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        'px-4 py-3 text-foreground',
                        alignClass[column.align ?? 'left'],
                        column.cellClassName,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean
  direction?: SortDirection
}) {
  if (!active) {
    return <ChevronsUpDown className="h-3.5 w-3.5 text-foreground-subtle" aria-hidden />
  }
  return direction === 'asc' ? (
    <ChevronUp className="h-3.5 w-3.5" aria-hidden />
  ) : (
    <ChevronDown className="h-3.5 w-3.5" aria-hidden />
  )
}
