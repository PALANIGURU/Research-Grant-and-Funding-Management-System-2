// src/pages/dashboard/reports/ReportsHub.jsx
import { useEffect, useState } from 'react'
import { Plus, CheckCircle } from 'lucide-react'
import {
  listMilestones,
  createMilestone,
  markMilestoneComplete,
  listProgressReports,
  createProgressReport,
  submitProgressReport,
  reviewProgressReport,
  listFinalReports,
  createFinalReport,
  submitFinalReport,
  reviewFinalReport,
} from '../../../api/reportsService'
import { listGrants } from '../../../api/grantsService'
import { useAuth } from '../../../context/AuthContext'
import { ROLES } from '../../../utils/roles'
import StatusBadge from '../../../components/common/StatusBadge'

const TABS = [
  { key: 'milestones', label: 'Milestones' },
  { key: 'progress', label: 'Progress Reports' },
  { key: 'final', label: 'Final Reports' },
]

export default function ReportsHub() {
  const { user } = useAuth()
  const isManager = user?.role === ROLES.ADMIN || user?.role === ROLES.GRANT_MANAGER
  const [tab, setTab] = useState('milestones')
  const [grants, setGrants] = useState([])

  useEffect(() => {
    const loadGrants = async () => {
      try {
        const data = await listGrants({ page_size: 100 })
        setGrants(data.results ?? [])
      } catch {
        // non-fatal
      }
    }
    loadGrants()
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Milestones & Reports</h1>
        <p className="text-slate-500 text-sm mt-1">
          Track grant milestones, progress reports, and final reports.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              tab === t.key
                ? 'border-ocean-700 text-ocean-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'milestones' && <MilestonesTab grants={grants} isManager={isManager} />}
      {tab === 'progress' && <ProgressReportsTab grants={grants} isManager={isManager} />}
      {tab === 'final' && <FinalReportsTab grants={grants} isManager={isManager} />}
    </div>
  )
}

function MilestonesTab({ grants, isManager }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ grant: '', title: '', description: '', due_date: '', deliverables: '' })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listMilestones({ page_size: 50 })
      setItems(data.results ?? [])
    } catch {
      setError('Failed to load milestones.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createMilestone(form)
      setForm({ grant: '', title: '', description: '', due_date: '', deliverables: '' })
      setShowForm(false)
      load()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to create milestone.')
    }
  }

  const handleComplete = async (id) => {
    try {
      await markMilestoneComplete(id)
      load()
    } catch {
      setError('Failed to mark complete.')
    }
  }

  return (
    <div className="space-y-4">
      {isManager && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 bg-ocean-700 hover:bg-ocean-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <Plus className="h-4 w-4" />
            New Milestone
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              required
              value={form.grant}
              onChange={(e) => setForm({ ...form, grant: e.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
            >
              <option value="">Select grant</option>
              {grants.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
            <input
              required
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
            />
          </div>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
          />
          <textarea
            required
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
          />
          <input
            placeholder="Deliverables"
            value={form.deliverables}
            onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-ocean-700 hover:bg-ocean-800"
          >
            Create Milestone
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ocean-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Due Date</th>
              <th className="text-left px-4 py-3">Progress</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No milestones found.</td>
              </tr>
            ) : (
              items.map((m) => (
                <tr key={m.id} className="hover:bg-ocean-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{m.title}</td>
                  <td className="px-4 py-3 text-slate-600">{m.due_date}</td>
                  <td className="px-4 py-3 text-slate-600">{m.completion_percentage}%</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.is_overdue ? 'OVERDUE' : m.status} />
                  </td>
                  <td className="px-4 py-3">
                    {m.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleComplete(m.id)}
                        className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Mark Complete
                      </button>
                    )}
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

function ProgressReportsTab({ grants, isManager }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    grant: '',
    period_start: '',
    period_end: '',
    summary: '',
    activities_completed: '',
    challenges: '',
    next_steps: '',
    expenditure_summary: '',
  })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listProgressReports({ page_size: 50 })
      setItems(data.results ?? [])
    } catch {
      setError('Failed to load progress reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createProgressReport({
        ...form,
        expenditure_summary: Number(form.expenditure_summary || 0),
      })
      setShowForm(false)
      load()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to create report.')
    }
  }

  const handleSubmitReport = async (id) => {
    try {
      await submitProgressReport(id)
      load()
    } catch {
      setError('Failed to submit report.')
    }
  }

  const handleReview = async (id, action) => {
    try {
      await reviewProgressReport(id, { action, review_comments: '' })
      load()
    } catch {
      setError('Failed to review report.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-ocean-700 hover:bg-ocean-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="h-4 w-4" />
          New Progress Report
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <select
            required
            value={form.grant}
            onChange={(e) => setForm({ ...form, grant: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
          >
            <option value="">Select grant</option>
            {grants.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
            <input required type="date" value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          </div>
          <textarea required placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <textarea required placeholder="Activities completed" value={form.activities_completed} onChange={(e) => setForm({ ...form, activities_completed: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <textarea placeholder="Challenges" value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <textarea placeholder="Next steps" value={form.next_steps} onChange={(e) => setForm({ ...form, next_steps: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <input type="number" min="0" step="0.01" placeholder="Expenditure so far ($)" value={form.expenditure_summary} onChange={(e) => setForm({ ...form, expenditure_summary: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-ocean-700 hover:bg-ocean-800">
            Save Draft
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ocean-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Report #</th>
              <th className="text-left px-4 py-3">Grant</th>
              <th className="text-left px-4 py-3">Period</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No progress reports found.</td></tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="hover:bg-ocean-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{r.report_number}</td>
                  <td className="px-4 py-3 text-slate-600">{r.grant_title}</td>
                  <td className="px-4 py-3 text-slate-600">{r.period_start} � {r.period_end}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 space-x-2">
                    {r.status === 'DRAFT' && (
                      <button onClick={() => handleSubmitReport(r.id)} className="text-xs text-ocean-800 hover:underline">Submit</button>
                    )}
                    {isManager && r.status === 'SUBMITTED' && (
                      <>
                        <button onClick={() => handleReview(r.id, 'APPROVE')} className="text-xs text-green-700 hover:underline">Approve</button>
                        <button onClick={() => handleReview(r.id, 'REVISE')} className="text-xs text-orange-700 hover:underline">Request Revision</button>
                      </>
                    )}
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

function FinalReportsTab({ grants, isManager }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    grant: '',
    summary: '',
    objectives_achieved: '',
    outcomes: '',
    publications: '',
    financial_summary: '',
    total_expenditure: '',
    lessons_learned: '',
    recommendations: '',
  })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listFinalReports({ page_size: 50 })
      setItems(data.results ?? [])
    } catch {
      setError('Failed to load final reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createFinalReport({
        ...form,
        total_expenditure: Number(form.total_expenditure),
      })
      setShowForm(false)
      load()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to create final report.')
    }
  }

  const handleSubmitReport = async (id) => {
    try {
      await submitFinalReport(id)
      load()
    } catch {
      setError('Failed to submit report.')
    }
  }

  const handleReview = async (id, action) => {
    try {
      await reviewFinalReport(id, { action, review_comments: '' })
      load()
    } catch {
      setError('Failed to review report.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-ocean-700 hover:bg-ocean-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus className="h-4 w-4" />
          New Final Report
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <select required value={form.grant} onChange={(e) => setForm({ ...form, grant: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600">
            <option value="">Select grant</option>
            {grants.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <textarea required placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <textarea required placeholder="Objectives achieved" value={form.objectives_achieved} onChange={(e) => setForm({ ...form, objectives_achieved: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <textarea required placeholder="Outcomes" value={form.outcomes} onChange={(e) => setForm({ ...form, outcomes: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <textarea placeholder="Publications" value={form.publications} onChange={(e) => setForm({ ...form, publications: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <textarea required placeholder="Financial summary" value={form.financial_summary} onChange={(e) => setForm({ ...form, financial_summary: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <input required type="number" min="0" step="0.01" placeholder="Total expenditure ($)" value={form.total_expenditure} onChange={(e) => setForm({ ...form, total_expenditure: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <textarea placeholder="Lessons learned" value={form.lessons_learned} onChange={(e) => setForm({ ...form, lessons_learned: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <textarea placeholder="Recommendations" value={form.recommendations} onChange={(e) => setForm({ ...form, recommendations: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600" />
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-ocean-700 hover:bg-ocean-800">
            Save Draft
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ocean-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Report #</th>
              <th className="text-left px-4 py-3">Grant</th>
              <th className="text-left px-4 py-3">Total Expenditure</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No final reports found.</td></tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="hover:bg-ocean-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{r.report_number}</td>
                  <td className="px-4 py-3 text-slate-600">{r.grant?.title}</td>
                  <td className="px-4 py-3 text-slate-600">${Number(r.total_expenditure).toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 space-x-2">
                    {r.status === 'DRAFT' && (
                      <button onClick={() => handleSubmitReport(r.id)} className="text-xs text-ocean-800 hover:underline">Submit</button>
                    )}
                    {isManager && r.status === 'SUBMITTED' && (
                      <>
                        <button onClick={() => handleReview(r.id, 'APPROVE')} className="text-xs text-green-700 hover:underline">Approve</button>
                        <button onClick={() => handleReview(r.id, 'REVISE')} className="text-xs text-orange-700 hover:underline">Request Revision</button>
                      </>
                    )}
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
