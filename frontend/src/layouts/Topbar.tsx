import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import type { UserRole } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'

interface TopbarProps {
  onToggleSidebar: () => void
}

const roleLabels: Record<UserRole, string> = {
  fleet_manager: 'Fleet Manager',
  driver: 'Driver',
  safety_officer: 'Safety Officer',
  financial_analyst: 'Financial Analyst',
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials =
    user?.name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ?? 'U'

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate(ROUTES.login)
  }

  const go = (path: string) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Toggle navigation"
      >
        <Menu className="h-[18px] w-[18px]" aria-hidden />
      </button>

      {/* Global search — wiring point for a future search endpoint / command palette. */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search vehicles, drivers, trips…"
          aria-label="Search"
          className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden />
          <span
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger"
            aria-hidden
          />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-slate-100"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </span>
            <span className="hidden text-left leading-tight md:block">
              <span className="block text-sm font-medium text-slate-900">
                {user?.name ?? 'User'}
              </span>
              <span className="block text-xs text-slate-500">
                {user ? roleLabels[user.role] : ''}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" aria-hidden />
          </button>

          {menuOpen && (
            <>
              {/* Invisible click-away catcher. */}
              <button
                type="button"
                className="fixed inset-0 z-30 cursor-default"
                aria-hidden
                tabIndex={-1}
                onClick={() => setMenuOpen(false)}
              />
              <div
                role="menu"
                className="absolute right-0 z-40 mt-1 w-48 rounded-lg border border-border bg-surface py-1 shadow-md"
              >
                <MenuItem icon={User} label="Profile" onClick={() => go(ROUTES.profile)} />
                <MenuItem
                  icon={Settings}
                  label="Settings"
                  onClick={() => go(ROUTES.settings)}
                />
                <div className="my-1 border-t border-border" />
                <MenuItem icon={LogOut} label="Sign out" onClick={handleLogout} />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 text-slate-400" aria-hidden />
      {label}
    </button>
  )
}
