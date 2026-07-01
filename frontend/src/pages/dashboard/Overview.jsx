// src/pages/dashboard/Overview.jsx
import { useEffect, useState } from 'react'
import { GraduationCap, FileText, Wallet, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { listGrants } from '../../api/grantsService'
import { listProposals } from '../../api/proposalsService'
import { listBudgets } from '../../api/budgetsService'
import { getUnreadCount } from '../../api/notificationsService'
import StatCard from '../../components/common/StatCard'
import { roleLabel } from '../../utils/roles'

export default function Overview() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    grants: 0,
    proposals: 0,
    budgets: 0,
    unread: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true)
      setError('')
      try {
        const [grants, proposals, budgets, unread] = await Promise.all([
          listGrants({ page_size: 1 }),
          listProposals({ page_size: 1 }),
          listBudgets({ page_size: 1 }),
          getUnreadCount(),
        ])
        setStats({
          grants: grants.count ?? 0,
          proposals: proposals.count ?? 0,
          budgets: budgets.count ?? 0,
          unread: unread.unread_count ?? unread.count ?? 0,
        })
      } catch (err) {
        setError('Could not load dashboard stats. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.first_name || 'there'} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          You're signed in as {roleLabel(user?.role)}. Here's what's happening.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Grant Opportunities"
          value={loading ? '—' : stats.grants}
          icon={GraduationCap}
          accent="blue"
        />
        <StatCard
          label="Proposals"
          value={loading ? '—' : stats.proposals}
          icon={FileText}
          accent="purple"
        />
        <StatCard
          label="Budgets"
          value={loading ? '—' : stats.budgets}
          icon={Wallet}
          accent="green"
        />
        <StatCard
          label="Unread Notifications"
          value={loading ? '—' : stats.unread}
          icon={Bell}
          accent="amber"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-800 mb-2">Quick tips</h2>
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
          <li>Use the sidebar to browse Grant Opportunities and submit Proposals.</li>
          <li>Track disbursements and budget utilization under Budgets.</li>
          <li>Report milestones and progress under Milestones & Reports.</li>
        </ul>
      </div>
    </div>
  )
}