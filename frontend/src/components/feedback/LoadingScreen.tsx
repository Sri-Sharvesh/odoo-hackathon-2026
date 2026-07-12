import { Spinner } from '@/components/ui/Spinner'

/** Centered loading indicator for route-level Suspense and data fetches. */
export function LoadingScreen({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-64 w-full flex-col items-center justify-center gap-3 text-foreground-muted"
    >
      <Spinner className="h-6 w-6" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
