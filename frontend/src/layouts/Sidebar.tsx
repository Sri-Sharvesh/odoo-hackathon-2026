import { Truck, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { APP_CONFIG } from '@/constants/config'
import { NAV_GROUPS } from '@/constants/navigation'
import { cn } from '@/utils/cn'

interface SidebarProps {
  isDesktop: boolean
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({
  isDesktop,
  collapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  // "Rail" = the icon-only collapsed state, desktop only.
  const isRail = isDesktop && collapsed

  return (
    <>
      {/* Scrim behind the mobile drawer. */}
      {!isDesktop && mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        aria-label="Primary navigation"
        className={cn(
          'z-40 flex shrink-0 flex-col border-r border-border bg-surface transition-all duration-200',
          isDesktop
            ? isRail
              ? 'w-16'
              : 'w-60'
            : cn(
                'fixed inset-y-0 left-0 w-64',
                mobileOpen ? 'translate-x-0' : '-translate-x-full',
              ),
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Truck className="h-[18px] w-[18px]" aria-hidden />
          </div>
          {!isRail && (
            <span className="truncate text-sm font-semibold text-foreground">
              {APP_CONFIG.appName}
            </span>
          )}
          {!isDesktop && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="ml-auto rounded-md p-1 text-foreground-muted hover:bg-muted"
              aria-label="Close navigation"
            >
              <X className="h-[18px] w-[18px]" aria-hidden />
            </button>
          )}
        </div>

        {/* Navigation groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-5 last:mb-0">
              {!isRail && (
                <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      title={isRail ? item.label : undefined}
                      onClick={isDesktop ? undefined : onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'relative flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                          isRail && 'justify-center',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground-muted hover:bg-muted hover:text-foreground',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                              aria-hidden
                            />
                          )}
                          <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                          {!isRail && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
