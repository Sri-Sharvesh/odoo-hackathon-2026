import { Settings } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      icon={Settings}
      title="Settings"
      description="Organisation, preferences and integration settings."
      note="Will hold organisation profile, units/locale preferences and integration configuration."
    />
  )
}
