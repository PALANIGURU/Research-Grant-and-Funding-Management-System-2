// src/pages/dashboard/proposals/ProposalsList.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { listProposals } from '../../../api/proposalsService'
import { useAuth } from '../../../context/AuthContext'
import { ROLES } from '../../../utils/roles'
import StatusBadge from '../../../components/common/StatusBadge'

const STATUS_OPTIONS = [
  '',
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'REVISION_REQUESTED',
]

export default function ProposalsList() {
  const { user } = useAuth()
  const isApplicant = user?.role === ROLES.RESEARCHER || user?.role === ROLES.CLIENT

  const [proposals, setProposals] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadProposals()
    }, 350)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page])

  const loadProposals = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page }
      if (search) params.search = search
      if (status) params.status = status
      const data = await listProposals(params)
      setProposals(data.results ?? [])
      setCount(data.count ?? 0)
    } catch (err) {
      setError('Failed to load proposals.')
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(count / 20))

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div>
          <h1 className="text-2xl font-bold text-slate-800">Proposals</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isApplicant
              ? 'Track the proposals you have submitted.'
              : 'Review and manage submitted proposals.'}
          </p>
        </div>
        {isApplicant && (
          <Link
            to="/dashboard/proposals/new"
            className="inline-flex items-center gap-2 bg-ocean-900 hover:bg-ocean-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <Plus className="h-4 w-4" />
            New Proposal
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
            placeholder="Search by title, reference number..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value)
          }}
          className="border border-slate-200 rounded-lg text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ocean-600"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s ? s.replace(/_/g, ' ') : 'All statuses'}
            </option>
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
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Grant</th>
              <th className="text-left px-4 py-3">Submitted By</th>
              <th className="text-left px-4 py-3">Budget Requested</th>
              <th className="text-left px-4 py-3">Avg Score</th>
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
            ) : proposals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No proposals found.
                </td>
              </tr>
            ) : (
              proposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-ocean-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/dashboard/proposals/${proposal.id}`}
                      className="font-medium text-ocean-800 hover:underline"
                    >
                      {proposal.title}
                    </Link>
                    <p className="text-xs text-slate-400">{proposal.reference_number}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{proposal.grant}</td>
                  <td className="px-4 py-3 text-slate-600">{proposal.submitted_by}</td>
                  <td className="px-4 py-3 text-slate-600">
                    ${Number(proposal.budget_requested).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {Number(proposal.average_score || 0).toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={proposal.status} />
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