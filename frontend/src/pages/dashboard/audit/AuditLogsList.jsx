// src/pages/dashboard/audit/AuditLogsList.jsx
import { useEffect, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { listAuditLogs } from '../../../api/auditService'

const ACTION_OPTIONS = [
  '', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
  'STATUS_CHANGE', 'APPROVAL', 'REJECTION', 'OTHER',
]

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-ocean-100 text-ocean-800',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-slate-100 text-slate-600',
  LOGOUT: 'bg-slate-100 text-slate-600',
  STATUS_CHANGE: 'bg-amber-100 text-amber-700',
  APPROVAL: 'bg-green-100 text-green-700',
  REJECTION: 'bg-red-100 text-red-700',
  OTHER: 'bg-slate-100 text-slate-600',
}

export default function AuditLogsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page_size: 50 }
      if (search) params.search = search
      if (action) params.action = action
      const data = await listAuditLogs(params)
      setItems(data.results ?? [])
    } catch {
      setError('Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, action])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
        <p className="text-slate-500 text-sm mt-1">
          System-wide trail of create, update, and status-change activity.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search model, object, path..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
          />
        </div>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
        >
          <option value="">All actions</option>
          {ACTION_OPTIONS.filter(Boolean).map((a) => (
            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ocean-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Action</th>
              <th className="text-left px-4 py-3">Model</th>
              <th className="text-left px-4 py-3">Object</th>
              <th className="text-left px-4 py-3">Path</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin inline" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No audit logs found.
                </td>
              </tr>
            ) : (
              items.map((log) => (
                <tr key={log.id} className="hover:bg-ocean-50">
                  <td className="px-4 py-3 text-slate-600">{log.user_email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{log.model_name}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                    {log.object_repr}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs max-w-[220px] truncate">
                    {log.request_method} {log.request_path}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}