import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

/** Grey placeholder block for loading states. Set width/height via `className`. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200/70', className)}
      {...props}
    />
  )
}
