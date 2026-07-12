import { CheckCircle2, Clock, Percent, Route, Truck, Users, Wrench } from 'lucide-react'
import { useState } from 'react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { PageHeader } from '@/components/common/PageHeader'
import { Select } from '@/components/ui/Select'
import { VEHICLE_TYPE_OPTIONS } from '@/constants/vehicleTypes'
import { useDashboardSummaryQuery } from '@/hooks/useDashboard'
import { vehicleStatusMeta } from '@/utils/statusPresentation'

const TYPE_FILTER_OPTIONS = [{ label: 'All types', value: '' }, ...VEHICLE_TYPE_OPTIONS]
const STATUS_FILTER_OPTIONS = [
  { label: 'All statuses', value: '' },
  ...Object.entries(vehicleStatusMeta).map(([value, meta]) => ({ label: meta.label, value })),
]

export default function DashboardPage() {
  const [type, setType] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading } = useDashboardSummaryQuery({
    type: type || undefined,
    status: status || undefined,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Fleet health at a glance — utilisation, active trips, costs and alerts."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          aria-label="Filter by vehicle type"
          className="sm:w-44"
          options={TYPE_FILTER_OPTIONS}
          value={type}
          onChange={(event) => setType(event.target.value)}
        />
        <Select
          aria-label="Filter by vehicle status"
          className="sm:w-44"
          options={STATUS_FILTER_OPTIONS}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard icon={Truck} label="Active Vehicles" value={data?.activeVehicles ?? 0} isLoading={isLoading} />
        <KpiCard
          icon={CheckCircle2}
          label="Available Vehicles"
          value={data?.availableVehicles ?? 0}
          isLoading={isLoading}
        />
        <KpiCard
          icon={Wrench}
          label="Vehicles in Maintenance"
          value={data?.vehiclesInMaintenance ?? 0}
          isLoading={isLoading}
        />
        <KpiCard icon={Route} label="Active Trips" value={data?.activeTrips ?? 0} isLoading={isLoading} />
        <KpiCard icon={Clock} label="Pending Trips" value={data?.pendingTrips ?? 0} isLoading={isLoading} />
        <KpiCard icon={Users} label="Drivers On Duty" value={data?.driversOnDuty ?? 0} isLoading={isLoading} />
        <KpiCard
          icon={Percent}
          label="Fleet Utilization"
          value={`${data?.fleetUtilization ?? 0}%`}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
