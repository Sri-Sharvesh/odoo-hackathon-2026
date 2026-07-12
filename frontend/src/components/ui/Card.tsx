import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

/** Minimal enterprise card: border + subtle shadow, small radius. Compose the parts below. */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-surface shadow-sm', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 border-b border-border px-5 py-4',
        className,
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-900', className)} {...props} />
  )
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-sm text-slate-500', className)} {...props} />
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center border-t border-border px-5 py-3', className)}
      {...props}
    />
  )
}
