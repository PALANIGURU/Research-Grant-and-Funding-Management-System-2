// src/pages/dashboard/grants/GrantForm.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createGrant,
  getGrant,
  updateGrant,
  listAgencies,
  listCategories,
} from '../../../api/grantsService'

const STATUS_OPTIONS = ['DRAFT', 'OPEN', 'CLOSED', 'AWARDED', 'COMPLETED', 'CANCELLED']

const emptyForm = {
  title: '',
  description: '',
  funding_agency: '',
  category: '',
  total_amount: '',
  application_deadline: '',
  start_date: '',
  end_date: '',
  eligibility_criteria: '',
  required_documents: '',
  max_proposals_per_researcher: 1,
  status: 'DRAFT',
}

export default function GrantForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [agencies, setAgencies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [agencyRes, categoryRes] = await Promise.all([
          listAgencies({ page_size: 100 }),
          listCategories({ page_size: 100 }),
        ])
        setAgencies(agencyRes.results ?? agencyRes ?? [])
        setCategories(categoryRes.results ?? categoryRes ?? [])
      } catch {
        setError('Failed to load agencies/categories.')
      }
    }
    loadLookups()
  }, [])

  useEffect(() => {
    if (!isEdit) return
    const loadGrant = async () => {
      setLoading(true)
      try {
        const data = await getGrant(id)
        setForm({
          title: data.title || '',
          description: data.description || '',
          funding_agency: data.funding_agency?.id || '',
          category: data.category?.id || '',
          total_amount: data.total_amount || '',
          application_deadline: data.application_deadline
            ? data.application_deadline.slice(0, 16)
            : '',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          eligibility_criteria: data.eligibility_criteria || '',
          required_documents: data.required_documents || '',
          max_proposals_per_researcher: data.max_proposals_per_researcher || 1,
          status: data.status || 'DRAFT',
        })
      } catch {
        setError('Failed to load grant.')
      } finally {
        setLoading(false)
      }
    }
    loadGrant()
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
      const payload = {
        ...form,
        total_amount: Number(form.total_amount),
        max_proposals_per_researcher: Number(form.max_proposals_per_researcher),
        application_deadline: new Date(form.application_deadline).toISOString(),
      }
      if (isEdit) {
        await updateGrant(id, payload)
      } else {
        await createGrant(payload)
      }
      navigate('/dashboard/grants')
    } catch (err) {
      const data = err.response?.data
      setError(
        data ? Object.values(data).flat().join(' ') : 'Failed to save grant. Check the fields.'
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
        {isEdit ? 'Edit Grant Opportunity' : 'New Grant Opportunity'}
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Funding Agency</label>
            <select
              name="funding_agency"
              value={form.funding_agency}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select agency</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount ($)</label>
            <input
              type="number"
              name="total_amount"
              value={form.total_amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Application Deadline</label>
            <input
              type="datetime-local"
              name="application_deadline"
              value={form.application_deadline}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Eligibility Criteria</label>
          <textarea
            name="eligibility_criteria"
            value={form.eligibility_criteria}
            onChange={handleChange}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Required Documents (comma-separated)
          </label>
          <input
            name="required_documents"
            value={form.required_documents}
            onChange={handleChange}
            placeholder="Proposal PDF, Budget Sheet, CV"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Max Proposals / Researcher
            </label>
            <input
              type="number"
              name="max_proposals_per_researcher"
              value={form.max_proposals_per_researcher}
              onChange={handleChange}
              min="1"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/grants')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Grant'}
          </button>
        </div>
      </form>
    </div>
  )
}