// src/pages/dashboard/notifications/NotificationsList.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../../api/notificationsService'

const TYPE_LABELS = {
  PROPOSAL_SUBMITTED: 'Proposal Submitted',
  PROPOSAL_APPROVED: 'Proposal Approved',
  PROPOSAL_REJECTED: 'Proposal Rejected',
  PROPOSAL_REVISION: 'Revision Requested',
  GRANT_OPENED: 'Grant Opportunity Opened',
  GRANT_AWARDED: 'Grant Awarded',
  GRANT_COMPLETED: 'Grant Completed',
  REVIEW_ASSIGNED: 'Review Assigned',
  REVIEW_COMPLETED: 'Review Completed',
  MILESTONE_DUE: 'Milestone Due Soon',
  MILESTONE_OVERDUE: 'Milestone Overdue',
  DISBURSEMENT_APPROVED: 'Disbursement Approved',
  DISBURSEMENT_REJECTED: 'Disbursement Rejected',
  REPORT_SUBMITTED: 'Report Submitted',
  REPORT_REVIEWED: 'Report Reviewed',
  SYSTEM: 'System Alert',
}

export default function NotificationsList() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all | unread

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page_size: 50 }
      if (filter === 'unread') params.is_read = false
      const data = await listNotifications(params)
      setItems(data.results ?? [])
    } catch {
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const handleClick = async (n) => {
    if (!n.is_read) {
      try {
        await markNotificationRead(n.id)
        setItems((prev) =>
          prev.map((it) => (it.id === n.id ? { ...it, is_read: true } : it))
        )
      } catch {
        // non-fatal
      }
    }
    if (n.link) navigate(n.link)
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      load()
    } catch {
      setError('Failed to mark all as read.')
    }
  }

  const unreadCount = items.filter((n) => !n.is_read).length

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">
            Stay up to date with proposals, grants, milestones, and reports.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-ocean-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              filter === t.key
                ? 'border-ocean-700 text-ocean-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <Bell className="h-8 w-8" />
            <p>No notifications found.</p>
          </div>
        ) : (
          items.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left px-5 py-4 flex items-start gap-3 transition hover:bg-ocean-50 ${
                !n.is_read ? 'bg-ocean-50/40' : ''
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                  !n.is_read ? 'bg-ocean-700' : 'bg-transparent'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm ${!n.is_read ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                    {n.title}
                  </p>
                  <span className="text-xs text-slate-400">
                    {TYPE_LABELS[n.notification_type] || n.notification_type}
                  </span>
                </div>
                {n.message && (
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}