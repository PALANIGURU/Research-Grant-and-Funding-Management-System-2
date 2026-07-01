// src/pages/dashboard/budgets/BudgetsList.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { listBudgets } from '../../../api/budgetsService'
import { useAuth } from '../../../context/AuthContext'
import { ROLES } from '../../../utils/roles'
import StatusBadge from '../../../components/common/StatusBadge'

export default function BudgetsList() {
  const { user } = useAuth()
  const canCreate = user?.role === ROLES.ADMIN || user?.role === ROLES.FINANCE_OFFICER

  const [budgets, setBudgets] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBudgets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const loadBudgets = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listBudgets({ page })
      setBudgets(data.results ?? [])
      setCount(data.count ?? 0)
    } catch {
      setError('Failed to load budgets.')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(count / 20))

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Budgets & Disbursements</h1>
          <p className="text-slate-500 text-sm mt-1">
            Track allocated funds, spending, and disbursement requests per grant.
          </p>
        </div>
        {canCreate && (
          <Link
            to="/dashboard/budgets/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <Plus className="h-4 w-4" />
            New Budget
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Grant</th>
              <th className="text-left px-4 py-3">Allocated</th>
              <th className="text-left px-4 py-3">Spent</th>
              <th className="text-left px-4 py-3">Remaining</th>
              <th className="text-left px-4 py-3">Utilization</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : budgets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No budgets found.
                </td>
              </tr>
            ) : (
              budgets.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/dashboard/budgets/${b.id}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {b.grant_title}
                    </Link>
                    <p className="text-xs text-slate-400">{b.grant_reference}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    ${Number(b.total_allocated).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    ${Number(b.total_spent).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    ${Number(b.remaining_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${Math.min(b.utilization_percentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs">{b.utilization_percentage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}