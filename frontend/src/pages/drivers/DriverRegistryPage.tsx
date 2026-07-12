import { Users } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function DriverRegistryPage() {
  return (
    <ModulePlaceholder
      icon={Users}
      title="Driver Management"
      description="Manage drivers, licences, availability and safety scores."
      note="Will surface licence-expiry and suspension status, and disable unavailable drivers in trip assignment via shared business-rule helpers."
    />
  )
}
