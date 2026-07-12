import { Truck } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function VehicleRegistryPage() {
  return (
    <ModulePlaceholder
      icon={Truck}
      title="Vehicle Registry"
      description="Register, search and manage every vehicle in the fleet."
      note="Will use the shared DataTable (search, sort, filters, pagination) and a validated create/edit form enforcing business rules such as unique registration numbers."
    />
  )
}
