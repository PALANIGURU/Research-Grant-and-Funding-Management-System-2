// src/pages/dashboard/budgets/BudgetForm.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBudget } from '../../../api/budgetsService'
import { listGrants } from '../../../api/grantsService'
import { getErrorMessage } from '../../../utils/errors'

export default function BudgetForm() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ grant: '', title: '', total_allocated: '', notes: '' })
  const [grants, setGrants] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadGrants = async () => {
      try {
        const data = await listGrants({ status: 'AWARDED', page_size: 100 })
        setGrants(data.results ?? [])
      } catch {
        // non-fatal
      }
    }
    loadGrants()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await createBudget({
        ...form,
        total_allocated: Number(form.total_allocated),
      })
      navigate('/dashboard/budgets')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create budget. Check the fields.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">New Budget</h1>
      <p className="text-slate-500 text-sm">
        Budgets can only be created for grants that have already been awarded.
      </p>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Awarded Grant</label>
          <select
            name="grant"
            value={form.grant}
            onChange={handleChange}
            required
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
          >
            <option value="">Select an awarded grant</option>
            {grants.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          {grants.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">
              No awarded grants available yet. Mark a grant as "Awarded" first.
            </p>
          )}
        </div>

<div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Budget Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. FY2026 Operating Budget"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
          />
          <p className="text-xs text-slate-400 mt-1">
            Optional — a custom name for this budget, separate from the grant's title.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Allocated ($)</label>
          <input
            type="number"
            name="total_allocated"
            value={form.total_allocated}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/budgets')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-ocean-700 hover:bg-ocean-800 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Create Budget'}
          </button>
        </div>
      </form>
    </div>
  )
}