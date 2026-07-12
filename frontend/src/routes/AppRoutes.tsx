import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { LoadingScreen } from '@/components/feedback/LoadingScreen'
import { ROUTES } from '@/constants/routes'
import { AppShell } from '@/layouts/AppShell'
import { ProtectedRoute } from './ProtectedRoute'

/*
 * Every page is code-split via React.lazy so the initial bundle stays small.
 * Pages rendered inside <AppShell> resolve against the shell's own <Suspense>
 * (so the chrome never flickers); public/full-screen pages get their own below.
 */
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const FleetTrackingPage = lazy(() => import('@/pages/tracking/FleetTrackingPage'))
const VehicleRegistryPage = lazy(() => import('@/pages/vehicles/VehicleRegistryPage'))
const DriverRegistryPage = lazy(() => import('@/pages/drivers/DriverRegistryPage'))
const TripsPage = lazy(() => import('@/pages/trips/TripsPage'))
const MaintenancePage = lazy(() => import('@/pages/maintenance/MaintenancePage'))
const FuelLogsPage = lazy(() => import('@/pages/fuel/FuelLogsPage'))
const ExpensesPage = lazy(() => import('@/pages/expenses/ExpensesPage'))
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'))
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'))
const RoleManagementPage = lazy(() => import('@/pages/roles/RoleManagementPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const UserProfilePage = lazy(() => import('@/pages/profile/UserProfilePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function FullscreenFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <LoadingScreen />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path={ROUTES.login}
        element={
          <Suspense fallback={<FullscreenFallback />}>
            <LoginPage />
          </Suspense>
        }
      />

      {/* Authenticated application */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path={ROUTES.dashboard} element={<DashboardPage />} />
          <Route path={ROUTES.fleetTracking} element={<FleetTrackingPage />} />
          <Route path={ROUTES.vehicles} element={<VehicleRegistryPage />} />
          <Route path={ROUTES.drivers} element={<DriverRegistryPage />} />
          <Route path={ROUTES.trips} element={<TripsPage />} />
          <Route path={ROUTES.maintenance} element={<MaintenancePage />} />
          <Route path={ROUTES.fuel} element={<FuelLogsPage />} />
          <Route path={ROUTES.expenses} element={<ExpensesPage />} />
          <Route path={ROUTES.reports} element={<ReportsPage />} />
          <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
          <Route path={ROUTES.roles} element={<RoleManagementPage />} />
          <Route path={ROUTES.settings} element={<SettingsPage />} />
          <Route path={ROUTES.profile} element={<UserProfilePage />} />
        </Route>
      </Route>

      {/* Fallbacks */}
      <Route
        path="/404"
        element={
          <Suspense fallback={<FullscreenFallback />}>
            <NotFoundPage />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
