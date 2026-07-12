import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingScreen } from '@/components/feedback/LoadingScreen'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'

/**
 * Guards authenticated areas. While the session is being restored it shows a loader;
 * unauthenticated users are redirected to /login with the intended path preserved.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingScreen label="Restoring session…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}
