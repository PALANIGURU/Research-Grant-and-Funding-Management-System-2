// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { LayoutGrid, GraduationCap, FileText, Wallet, BarChart3, Bell, Users, ClipboardList, Mail, TrendingUp, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/roles'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/dashboard/grants', label: 'Grant Opportunities', icon: GraduationCap },
  { to: '/dashboard/proposals', label: 'Proposals', icon: FileText },
  { to: '/dashboard/budgets', label: 'Budgets & Disbursements', icon: Wallet },
  { to: '/dashboard/reports', label: 'Milestones & Reports', icon: BarChart3 },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
{ to: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp, roles: [ROLES.ADMIN, ROLES.GRANT_MANAGER, ROLES.FINANCE_OFFICER, ROLES.REVIEWER, ROLES.RESEARCHER] },
]

// Extra items only visible to certain roles
const adminItems = [
  { to: '/dashboard/users', label: 'User Management', icon: Users, roles: [ROLES.ADMIN] },
  { to: '/dashboard/audit', label: 'Audit Logs', icon: ClipboardList, roles: [ROLES.ADMIN] },
  { to: '/dashboard/contact-messages', label: 'Contact Messages', icon: Mail, roles: [ROLES.ADMIN] },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-ocean-700 text-white'
        : 'text-ocean-200 hover:bg-ocean-800 hover:text-white'
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
        className={`fixed lg:static top-0 left-0 z-40 h-screen lg:h-auto w-64 bg-ocean-900 border-r border-ocean-800 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
       <div className="flex items-center justify-between px-5 py-4 border-b border-ocean-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-ocean-700 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white">RGFMS</span>
          </div>
          <button className="lg:hidden text-ocean-300" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(user?.role))
            .map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
                <Icon className="h-4.5 w-4.5" />
                {label}
              </NavLink>
            ))}

          {adminItems.some((item) => item.roles.includes(user?.role)) && (
            <>
      <p className="px-3 pt-4 pb-1 text-xs font-semibold text-ocean-400 uppercase">
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