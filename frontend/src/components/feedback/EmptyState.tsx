import { Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  /** Optional call-to-action, e.g. an "Add vehicle" button. */
  action?: ReactNode
}

/** Neutral placeholder for lists/tables that have no data yet. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground-subtle">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
