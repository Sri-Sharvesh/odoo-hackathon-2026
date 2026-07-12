import { FileText } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      icon={FileText}
      title="Reports"
      description="Generate and export operational reports."
      note="Will offer parameterised report generation with export (CSV/PDF) over the reporting service."
    />
  )
}
