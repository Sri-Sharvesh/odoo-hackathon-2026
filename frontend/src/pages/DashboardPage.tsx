import { LayoutDashboard } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function DashboardPage() {
  return (
    <ModulePlaceholder
      icon={LayoutDashboard}
      title="Dashboard"
      description="Fleet health at a glance — utilisation, active trips, costs and alerts."
      note="Will show KPI cards (fleet utilisation, active/available vehicles, drivers on duty, revenue vs. cost), recent trips, and maintenance/licence alerts, all fed by dashboardService."
    />
  )
}
