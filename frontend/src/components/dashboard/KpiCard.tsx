import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export interface KpiCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  isLoading?: boolean
}

/** Compact enterprise KPI tile: icon, label, big number. No charts, no gradients. */
export function KpiCard({ icon: Icon, label, value, isLoading }: KpiCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground-muted">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-14" />
          ) : (
            <p className="text-xl font-semibold text-foreground">{value}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
