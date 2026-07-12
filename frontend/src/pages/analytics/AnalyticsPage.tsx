import { BarChart3 } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function AnalyticsPage() {
  return (
    <ModulePlaceholder
      icon={BarChart3}
      title="Analytics"
      description="Trends and insights across utilisation, cost and performance."
      note="Will present focused, small-multiple charts (not oversized dashboards) sourced from an analytics service."
    />
  )
}
