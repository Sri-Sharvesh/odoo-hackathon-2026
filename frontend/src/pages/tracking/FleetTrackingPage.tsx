import { Navigation } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function FleetTrackingPage() {
  return (
    <ModulePlaceholder
      icon={Navigation}
      title="Fleet Tracking"
      description="Live GPS positions, routes and status for every active vehicle."
      note="Phase 1 target: a provider-abstracted map (~70%) beside a searchable fleet panel (~30%), live vehicle markers, route polylines and real-time KPIs — driven by gpsService/trackingService with mock movement."
    />
  )
}
