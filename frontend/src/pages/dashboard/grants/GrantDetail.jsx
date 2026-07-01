// src/pages/dashboard/grants/GrantDetail.jsx
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { getGrant, deleteGrant } from '../../../api/grantsService'
import { useAuth } from '../../../context/AuthContext'
import { ROLES } from '../../../utils/roles'
import StatusBadge from '../../../components/common/StatusBadge'

export default function GrantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = user?.role === ROLES.ADMIN || user?.role === ROLES.GRANT_MANAGER
  const isResearcher = user?.role === ROLES.RESEARCHER

  const [grant, setGrant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const loadGrant = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getGrant(id)
        setGrant(data)
      } catch {
        setError('Failed to load grant details.')
      } finally {
        setLoading(false)
      }
    }
    loadGrant()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm('Delete this grant opportunity? This cannot be undone.')) return
    setDeleting(true)
    try {
      await deleteGrant(id)
      navigate('/dashboard/grants')
    } catch {
      setError('Failed to delete grant.')
      setDeleting(false)
    }
  }

  if (loading) return <p className="text-slate-400">Loading...</p>
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
        {error}
      </div>
    )
  }
  if (!grant) return null

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        to="/dashboard/grants"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Grant Opportunities
      </Link>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{grant.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{grant.reference_number}</p>
          </div>
          <StatusBadge status={grant.status} />
        </div>

        <p className="text-slate-600 text-sm leading-relaxed">{grant.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Funding Agency</p>
            <p className="font-medium text-slate-800">{grant.funding_agency?.name}</p>
          </div>
          <div>
            <p className="text-slate-400">Category</p>
            <p className="font-medium text-slate-800">{grant.category?.name || '—'}</p>
          </div>
          <div>
            <p className="text-slate-400">Total Amount</p>
            <p className="font-medium text-slate-800">
              ${Number(grant.total_amount).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Application Deadline</p>
            <p className="font-medium text-slate-800">
              {new Date(grant.application_deadline).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Start Date</p>
            <p className="font-medium text-slate-800">{grant.start_date}</p>
          </div>
          <div>
            <p className="text-slate-400">End Date</p>
            <p className="font-medium text-slate-800">{grant.end_date}</p>
          </div>
          <div>
            <p className="text-slate-400">Days Remaining</p>
            <p className="font-medium text-slate-800">{grant.days_remaining}</p>
          </div>
          <div>
            <p className="text-slate-400">Max Proposals / Researcher</p>
            <p className="font-medium text-slate-800">{grant.max_proposals_per_researcher}</p>
          </div>
        </div>

        {grant.eligibility_criteria && (
          <div>
            <p className="text-slate-400 text-sm mb-1">Eligibility Criteria</p>
            <p className="text-slate-700 text-sm whitespace-pre-line">
              {grant.eligibility_criteria}
            </p>
          </div>
        )}

        {grant.required_documents && (
          <div>
            <p className="text-slate-400 text-sm mb-1">Required Documents</p>
            <p className="text-slate-700 text-sm">{grant.required_documents}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
          {isResearcher && grant.is_open && (
            <Link
              to={`/dashboard/proposals/new?grant=${grant.id}`}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Apply with a Proposal
            </Link>
          )}
          {canManage && (
            <>
              <Link
                to={`/dashboard/grants/${grant.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}