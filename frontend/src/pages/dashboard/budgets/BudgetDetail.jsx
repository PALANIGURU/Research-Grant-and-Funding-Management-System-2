// src/pages/dashboard/budgets/BudgetDetail.jsx
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import {
  getBudget,
  activateBudget,
  freezeBudget,
  closeBudget,
  listBudgetItems,
  addBudgetItem,
  requestDisbursement,
  approveDisbursement,
  disburseDisbursement,
  rejectDisbursement,
} from '../../../api/budgetsService'
import { useAuth } from '../../../context/AuthContext'
import { ROLES } from '../../../utils/roles'
import StatusBadge from '../../../components/common/StatusBadge'

const CATEGORY_OPTIONS = [
  'PERSONNEL',
  'EQUIPMENT',
  'TRAVEL',
  'SUPPLIES',
  'CONSULTING',
  'OVERHEAD',
  'OTHER',
]

export default function BudgetDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const isFinance = user?.role === ROLES.ADMIN || user?.role === ROLES.FINANCE_OFFICER

  const [budget, setBudget] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const [showItemForm, setShowItemForm] = useState(false)
  const [itemForm, setItemForm] = useState({ category: 'PERSONNEL', description: '', amount_allocated: '' })

  const [showDisbForm, setShowDisbForm] = useState(false)
  const [disbForm, setDisbForm] = useState({ amount: '', disbursement_date: '', description: '' })

  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getBudget(id)
      setBudget(data)
      const itemsData = await listBudgetItems(id)
      setItems(itemsData.data ?? [])
    } catch {
      setError('Failed to load budget.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleStatusAction = async (fn) => {
    setActionLoading(true)
    setError('')
    try {
      await fn(id)
      await load()
    } catch {
      setError('Action failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setError('')
    try {
      await addBudgetItem(id, {
        ...itemForm,
        amount_allocated: Number(itemForm.amount_allocated),
      })
      setItemForm({ category: 'PERSONNEL', description: '', amount_allocated: '' })
      setShowItemForm(false)
      await load()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to add line item.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRequestDisbursement = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    setError('')
    try {
      await requestDisbursement(id, disbForm)
      setDisbForm({ amount: '', disbursement_date: '', description: '' })
      setShowDisbForm(false)
      await load()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Failed to request disbursement.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDisbursementAction = async (disbId, fn, payload) => {
    setActionLoading(true)
    setError('')
    try {
      await fn(disbId, payload)
      await load()
      setRejectingId(null)
      setRejectReason('')
    } catch {
      setError('Action failed.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <p className="text-slate-400">Loading...</p>
  if (error && !budget) {
    return (
      <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
        {error}
      </div>
    )
  }
  if (!budget) return null

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        to="/dashboard/budgets"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Budgets
      </Link>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{budget.grant?.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{budget.grant?.reference_number}</p>
          </div>
          <StatusBadge status={budget.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Allocated</p>
            <p className="font-medium text-slate-800">
              ${Number(budget.total_allocated).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Spent</p>
            <p className="font-medium text-slate-800">
              ${Number(budget.total_spent).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Remaining</p>
            <p className="font-medium text-slate-800">
              ${Number(budget.remaining_amount).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Utilization</p>
            <p className="font-medium text-slate-800">{budget.utilization_percentage}%</p>
          </div>
        </div>

        {budget.notes && (
          <div>
            <p className="text-slate-400 text-sm mb-1">Notes</p>
            <p className="text-slate-700 text-sm">{budget.notes}</p>
          </div>
        )}

        {isFinance && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            {budget.status === 'DRAFT' && (
              <button
                onClick={() => handleStatusAction(activateBudget)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
              >
                Activate
              </button>
            )}
            {budget.status === 'ACTIVE' && (
              <button
                onClick={() => handleStatusAction(freezeBudget)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:bg-ocean-50"
              >
                Freeze
              </button>
            )}
            {['ACTIVE', 'FROZEN'].includes(budget.status) && (
              <button
                onClick={() => handleStatusAction(closeBudget)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
              >
                Close
              </button>
            )}
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Budget Line Items</h2>
          {isFinance && (
            <button
              onClick={() => setShowItemForm((v) => !v)}
              className="inline-flex items-center gap-1.5 text-sm text-ocean-700 hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          )}
        </div>

        {showItemForm && (
          <form onSubmit={handleAddItem} className="border border-slate-100 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
              />
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount allocated"
                value={itemForm.amount_allocated}
                onChange={(e) => setItemForm({ ...itemForm, amount_allocated: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-ocean-700 hover:bg-ocean-800 disabled:opacity-60"
            >
              Save Item
            </button>
          </form>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No line items yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-700">{item.description}</p>
                  <p className="text-xs text-slate-400">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-700">
                    ${Number(item.amount_spent).toLocaleString()} / $
                    {Number(item.amount_allocated).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    ${Number(item.remaining).toLocaleString()} remaining
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disbursements */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Disbursements</h2>
          <button
            onClick={() => setShowDisbForm((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm text-ocean-700 hover:underline"
          >
            <Plus className="h-4 w-4" />
            Request Disbursement
          </button>
        </div>

        {showDisbForm && (
          <form onSubmit={handleRequestDisbursement} className="border border-slate-100 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={disbForm.amount}
                onChange={(e) => setDisbForm({ ...disbForm, amount: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
              />
              <input
                required
                type="date"
                value={disbForm.disbursement_date}
                onChange={(e) => setDisbForm({ ...disbForm, disbursement_date: e.target.value })}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
              />
            </div>
            <textarea
              required
              placeholder="Description / purpose"
              value={disbForm.description}
              onChange={(e) => setDisbForm({ ...disbForm, description: e.target.value })}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
            />
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-ocean-700 hover:bg-ocean-800 disabled:opacity-60"
            >
              Submit Request
            </button>
          </form>
        )}

        {budget.disbursements?.length === 0 || !budget.disbursements ? (
          <p className="text-sm text-slate-400">No disbursements yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {budget.disbursements.map((d) => (
              <div key={d.id} className="py-3 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">
                      ${Number(d.amount).toLocaleString()} — {d.reference_number}
                    </p>
                    <p className="text-xs text-slate-400">{d.description}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                {d.rejection_reason && (
                  <p className="text-xs text-red-600">Rejected: {d.rejection_reason}</p>
                )}
                {isFinance && (
                  <div className="flex gap-2">
                    {d.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleDisbursementAction(d.id, approveDisbursement)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(rejectingId === d.id ? null : d.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {d.status === 'APPROVED' && (
                      <button
                        onClick={() => handleDisbursementAction(d.id, disburseDisbursement)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-ocean-700 hover:bg-ocean-800 disabled:opacity-60"
                      >
                        Mark Disbursed
                      </button>
                    )}
                  </div>
                )}
                {rejectingId === d.id && (
                  <div className="flex gap-2">
                    <input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Rejection reason"
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={() =>
                        handleDisbursementAction(d.id, rejectDisbursement, {
                          rejection_reason: rejectReason,
                        })
                      }
                      disabled={!rejectReason || actionLoading}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}