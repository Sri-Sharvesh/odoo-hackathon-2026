import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  action?: ReactNode
}

/** Inline error panel with an optional retry. Use for failed data fetches. */
export function ErrorState({
  title = 'Something went wrong',
  description = 'The data could not be loaded. Please try again.',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface px-6 py-12 text-center"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-surface text-danger">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mx-auto max-w-sm text-sm text-foreground-muted">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
      {action}
    </div>
  )
}
