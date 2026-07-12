import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { LoadingScreen } from '@/components/feedback/LoadingScreen'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

/**
 * Authenticated application frame: persistent sidebar + top bar around a scrollable
 * content region. The sidebar collapses to a rail on desktop and to an off-canvas
 * drawer below the `lg` breakpoint.
 */
export function AppShell() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleToggleSidebar = () => {
    if (isDesktop) setCollapsed((value) => !value)
    else setMobileOpen(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isDesktop={isDesktop}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <ErrorBoundary>
              <Suspense fallback={<LoadingScreen />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
