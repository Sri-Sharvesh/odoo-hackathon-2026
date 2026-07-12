import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      intent: {
        neutral: 'border-border bg-muted text-foreground-muted',
        info: 'border-primary/20 bg-info-surface text-primary',
        success: 'border-success/20 bg-success-surface text-success',
        warning: 'border-warning/30 bg-warning-surface text-amber-700 dark:text-amber-400',
        danger: 'border-danger/20 bg-danger-surface text-danger',
      },
    },
    defaultVariants: { intent: 'neutral' },
  },
)

export interface BadgeProps
  extends ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  /** Render a leading status dot in the current text colour. */
  dot?: boolean
}

/** Small, rectangular, subtle status label — intentionally not a pill. */
export function Badge({ className, intent, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ intent }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  )
}
