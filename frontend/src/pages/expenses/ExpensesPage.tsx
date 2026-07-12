import { Receipt } from 'lucide-react'
import { ModulePlaceholder } from '@/components/common/ModulePlaceholder'

export default function ExpensesPage() {
  return (
    <ModulePlaceholder
      icon={Receipt}
      title="Expenses"
      description="Capture and categorise operational expenses."
      note="Will support expense entry, categorisation and approval, feeding the operational-cost figures on the dashboard."
    />
  )
}
