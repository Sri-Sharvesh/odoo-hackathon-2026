import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PageHeader } from './PageHeader'

export interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  /** Short note describing what will live here, shown to teammates/reviewers. */
  note?: string
  actions?: ReactNode
}

/**
 * Consistent scaffold for modules that are routed but not yet built. Keeps every
 * "coming soon" screen identical so the app feels complete while phases land.
 */
export function ModulePlaceholder({
  title,
  description,
  icon,
  note,
  actions,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} actions={actions} />
      <EmptyState
        icon={icon}
        title={`${title} — planned for a later phase`}
        description={
          note ??
          'This module is scaffolded and routed. It will be built on top of the shared service layer, DataTable and UI kit.'
        }
      />
    </div>
  )
}
