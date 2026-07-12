import { Download, Percent } from 'lucide-react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { PageHeader } from '@/components/common/PageHeader'
import type { Column } from '@/components/data/DataTable'
import { DataTable } from '@/components/data/DataTable'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/Button'
import { useDashboardSummaryQuery } from '@/hooks/useDashboard'
import { useVehicleReportsQuery } from '@/hooks/useReports'
import type { VehicleReport } from '@/types/report'
import { downloadCsv } from '@/utils/csv'
import { formatCurrency, formatDistanceKm, formatNumber } from '@/utils/format'

export default function ReportsPage() {
  const { data: reports, isLoading, isError, refetch } = useVehicleReportsQuery()
  const { data: summary } = useDashboardSummaryQuery()

  const columns: Array<Column<VehicleReport>> = [
    {
      id: 'registrationNumber',
      header: 'Vehicle',
      cell: (row) => (
        <span className="font-medium text-foreground">
          {row.registrationNumber} — {row.model}
        </span>
      ),
    },
    {
      id: 'totalDistanceKm',
      header: 'Distance',
      align: 'right',
      cell: (row) => formatDistanceKm(row.totalDistanceKm),
    },
    {
      id: 'fuelEfficiencyKmPerLiter',
      header: 'Fuel Efficiency',
      align: 'right',
      cell: (row) =>
        row.fuelEfficiencyKmPerLiter === null
          ? '—'
          : `${formatNumber(row.fuelEfficiencyKmPerLiter, 1)} km/L`,
    },
    {
      id: 'operationalCost',
      header: 'Operational Cost',
      align: 'right',
      cell: (row) => formatCurrency(row.operationalCost),
    },
    {
      id: 'roi',
      header: 'ROI',
      align: 'right',
      cell: (row) => (row.roi === null ? '—' : `${formatNumber(row.roi * 100, 1)}%`),
    },
  ]

  const handleExport = () => {
    if (!reports) return
    downloadCsv(
      'vehicle-reports.csv',
      reports.map((r) => ({
        Vehicle: `${r.registrationNumber} - ${r.model}`,
        'Distance (km)': r.totalDistanceKm,
        'Fuel Efficiency (km/L)': r.fuelEfficiencyKmPerLiter ?? '',
        'Operational Cost': r.operationalCost,
        'ROI (%)': r.roi === null ? '' : r.roi * 100,
      })),
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports" description="Fuel efficiency, operational cost and ROI per vehicle." />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Fuel efficiency, operational cost and ROI per vehicle."
        actions={
          <Button variant="outline" onClick={handleExport} disabled={!reports?.length}>
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard icon={Percent} label="Fleet Utilization" value={`${summary?.fleetUtilization ?? 0}%`} />
      </div>

      <DataTable
        columns={columns}
        data={reports ?? []}
        getRowId={(row) => row.vehicleId}
        isLoading={isLoading}
        emptyState={
          <div className="p-8">
            <EmptyState title="No vehicles yet" description="Add a vehicle to see its report here." />
          </div>
        }
      />

      <p className="text-xs text-foreground-muted">
        ROI shows &ldquo;—&rdquo; until trip revenue is tracked in the system; it is currently
        computed as (Revenue − (Maintenance + Fuel)) ÷ Acquisition Cost.
      </p>
    </div>
  )
}
