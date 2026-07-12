/**
 * Sidebar navigation model. The sidebar renders purely from this data, so adding a
 * module is a one-line change here — no layout edits required.
 */
import {
  BarChart3,
  FileText,
  Fuel,
  LayoutDashboard,
  Navigation,
  Receipt,
  Route,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from './routes'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  /** Marks a destination that is still a placeholder pending its own build phase. */
  comingSoon?: boolean
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Operations',
    items: [
      { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard },
      { label: 'Fleet Tracking', to: ROUTES.fleetTracking, icon: Navigation },
      { label: 'Trips', to: ROUTES.trips, icon: Route },
    ],
  },
  {
    title: 'Registry',
    items: [
      { label: 'Vehicles', to: ROUTES.vehicles, icon: Truck },
      { label: 'Drivers', to: ROUTES.drivers, icon: Users },
    ],
  },
  {
    title: 'Costs & Upkeep',
    items: [
      { label: 'Maintenance', to: ROUTES.maintenance, icon: Wrench },
      { label: 'Fuel Logs', to: ROUTES.fuel, icon: Fuel },
      { label: 'Expenses', to: ROUTES.expenses, icon: Receipt },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Reports', to: ROUTES.reports, icon: FileText },
      { label: 'Analytics', to: ROUTES.analytics, icon: BarChart3 },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Role Management', to: ROUTES.roles, icon: ShieldCheck },
      { label: 'Settings', to: ROUTES.settings, icon: Settings },
    ],
  },
]
