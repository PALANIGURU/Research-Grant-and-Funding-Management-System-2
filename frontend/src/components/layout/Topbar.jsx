// src/components/layout/Topbar.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, LogOut, ChevronDown, User, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { roleLabel } from '../../utils/roles'
import { getUnreadCount } from '../../api/notificationsService'
export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await getUnreadCount()
        setUnreadCount(data?.data?.unread_count ?? 0)
      } catch {
        // non-fatal
      }
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])
  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : ''

return (
    <header className="sticky top-0 z-20 bg-ocean-900 border-b border-ocean-800">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
     <button
          className="lg:hidden text-ocean-300"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="hidden lg:block" />

         <button
          onClick={() => navigate('/dashboard/notifications')}
          className="relative p-2 rounded-lg hover:bg-ocean-800 transition text-ocean-300"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
   <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-ocean-800 transition"
          >
            <div className="h-8 w-8 rounded-full bg-ocean-700 text-white text-xs font-semibold flex items-center justify-center">
              {initials || <User className="h-4 w-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white leading-tight">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-ocean-300 leading-tight">
                {roleLabel(user?.role)}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-ocean-300" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-ocean-800 border border-ocean-700 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-300 hover:bg-ocean-700 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}