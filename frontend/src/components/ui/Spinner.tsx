import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

/** Inline loading indicator. Pair with `role="status"` containers for a11y. */
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn('h-4 w-4 animate-spin text-slate-400', className)} aria-hidden />
  )
}
