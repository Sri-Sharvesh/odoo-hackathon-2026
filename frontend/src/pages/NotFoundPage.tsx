import { Compass } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
        <Compass className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-semibold text-slate-900">404</p>
        <p className="text-sm text-slate-500">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        </p>
      </div>
      <Button variant="outline" onClick={() => navigate(ROUTES.dashboard)}>
        Back to dashboard
      </Button>
    </div>
  )
}
