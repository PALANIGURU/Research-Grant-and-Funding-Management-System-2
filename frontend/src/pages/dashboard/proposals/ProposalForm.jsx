// src/pages/dashboard/proposals/ProposalForm.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  createProposal,
  getProposal,
  updateProposal,
} from '../../../api/proposalsService'
import { listGrants } from '../../../api/grantsService'

const emptyForm = {
  grant: '',
  title: '',
  abstract: '',
  methodology: '',
  expected_outcomes: '',
  budget_requested: '',
  duration_months: '',
  team_members: '',
}

export default function ProposalForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    ...emptyForm,
    grant: searchParams.get('grant') || '',
  })
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGrants = async () => {
      try {
        const data = await listGrants({ status: 'OPEN', page_size: 100 })
        setGrants(data.results ?? [])
      } catch {
        // Non-fatal; form still usable if grant already selected
      }
    }
    loadGrants()
  }, [])

  useEffect(() => {
    if (!isEdit) return
    const loadProposal = async () => {
      setLoading(true)
      try {
        const data = await getProposal(id)
        setForm({
          grant: data.grant?.id || '',
          title: data.title || '',
          abstract: data.abstract || '',
          methodology: data.methodology || '',
          expected_outcomes: data.expected_outcomes || '',
          budget_requested: data.budget_requested || '',
          duration_months: data.duration_months || '',
          team_members: data.team_members || '',
        })
      } catch {
        setError('Failed to load proposal.')
      } finally {
        setLoading(false)
      }
    }
    loadProposal()
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        const { grant, ...rest } = form
        await updateProposal(id, {
          ...rest,
          budget_requested: Number(form.budget_requested),
          duration_months: Number(form.duration_months),
        })
      } else {
        await createProposal({
          ...form,
          budget_requested: Number(form.budget_requested),
          duration_months: Number(form.duration_months),
        })
      }
      navigate('/dashboard/proposals')
    } catch (err) {
      const data = err.response?.data
      setError(
        data ? Object.values(data).flat().join(' ') : 'Failed to save proposal. Check the fields.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-slate-400">Loading...</p>
  }

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">
        {isEdit ? 'Edit Proposal' : 'New Proposal'}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Grant Opportunity</label>
          <select
            name="grant"
            value={form.grant}
            onChange={handleChange}
            required
            disabled={isEdit}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
          >
            <option value="">Select an open grant</option>
            {grants.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          {isEdit && (
            <p className="text-xs text-slate-400 mt-1">Grant cannot be changed after creation.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Abstract</label>
          <textarea
            name="abstract"
            value={form.abstract}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Methodology</label>
          <textarea
            name="methodology"
            value={form.methodology}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expected Outcomes</label>
          <textarea
            name="expected_outcomes"
            value={form.expected_outcomes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Budget Requested ($)</label>
            <input
              type="number"
              name="budget_requested"
              value={form.budget_requested}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (months)</label>
            <input
              type="number"
              name="duration_months"
              value={form.duration_months}
              onChange={handleChange}
              required
              min="1"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Team Members
          </label>
          <textarea
            name="team_members"
            value={form.team_members}
            onChange={handleChange}
            rows={2}
            placeholder="e.g. Dr. Jane Doe (Co-PI), John Smith (Research Assistant)"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/proposals')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Proposal (Draft)'}
          </button>
        </div>
      </form>
    </div>
  )
}