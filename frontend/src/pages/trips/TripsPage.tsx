import { Route } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function TripsPage() {
  return (
    <ModulePlaceholder
      icon={Route}
      title="Trip Management"
      description="Create, dispatch and monitor trips across the fleet."
      note="Trip creation will validate vehicle/driver availability and cargo-vs-capacity (Draft → Dispatched → Completed → Cancelled), disabling invalid selections with an explanation."
    />
  )
}
