// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Wallet,
  BarChart3,
  Bell,
  Users,
  ClipboardList,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/roles'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/grants', label: 'Grant Opportunities', icon: GraduationCap },
  { to: '/dashboard/proposals', label: 'Proposals', icon: FileText },
  { to: '/dashboard/budgets', label: 'Budgets & Disbursements', icon: Wallet },
  { to: '/dashboard/reports', label: 'Milestones & Reports', icon: BarChart3 },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
]

// Extra items only visible to certain roles
const adminItems = [
  { to: '/dashboard/users', label: 'User Management', icon: Users, roles: [ROLES.ADMIN] },
  { to: '/dashboard/audit', label: 'Audit Logs', icon: ClipboardList, roles: [ROLES.ADMIN] },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-slate-800">RGFMS</span>
          </div>
          <button className="lg:hidden text-slate-400" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
              <Icon className="h-4.5 w-4.5" />
              {label}
            </NavLink>
          ))}

          {adminItems.some((item) => item.roles.includes(user?.role)) && (
            <>
              <p className="px-3 pt-4 pb-1 text-xs font-semibold text-slate-400 uppercase">
                Admin
              </p>
              {adminItems
                .filter((item) => item.roles.includes(user?.role))
                .map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={linkClass} onClick={onClose}>
                    <Icon className="h-4.5 w-4.5" />
                    {label}
                  </NavLink>
                ))}
            </>
          )}
        </nav>
      </aside>
    </>
  )
}