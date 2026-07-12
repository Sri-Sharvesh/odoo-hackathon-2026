import type { ComponentProps } from 'react'
import { cn } from '@/utils/cn'

/** Themed placeholder block for loading states. Set width/height via `className`. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-foreground/10', className)}
      {...props}
    />
  )
}
