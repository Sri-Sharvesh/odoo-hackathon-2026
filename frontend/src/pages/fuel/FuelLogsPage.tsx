import { Fuel } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function FuelLogsPage() {
  return (
    <ModulePlaceholder
      icon={Fuel}
      title="Fuel Logs"
      description="Record fuel purchases and monitor consumption efficiency."
      note="Will compute efficiency (distance per unit) and flag anomalies that may indicate fuel theft."
    />
  )
}
