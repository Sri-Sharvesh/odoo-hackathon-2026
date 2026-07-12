import { Wrench } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function MaintenancePage() {
  return (
    <ModulePlaceholder
      icon={Wrench}
      title="Maintenance"
      description="Schedule and track service, repairs and inspections."
      note="Will track scheduled/in-progress/overdue work and mark affected vehicles unavailable for dispatch."
    />
  )
}
