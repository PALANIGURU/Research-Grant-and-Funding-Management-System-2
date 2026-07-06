// src/pages/dashboard/analytics/AnalyticsDashboard.jsx
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Loader2, Award, FileText, Wallet, TrendingUp } from 'lucide-react'
import { listGrants } from '../../../api/grantsService'
import { listProposals } from '../../../api/proposalsService'
import { listDisbursements } from '../../../api/budgetsService'
import StatCard from '../../../components/common/StatCard'

const OCEAN_SHADES = ['#0F1F40', '#21335C', '#2E4478', '#46609E', '#6D87BE', '#9AAED6']

const GRANT_STATUSES = ['DRAFT', 'OPEN', 'CLOSED', 'AWARDED', 'COMPLETED', 'CANCELLED']
const PROPOSAL_STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED']
const DISBURSEMENT_STATUSES = ['PENDING', 'APPROVED', 'DISBURSED', 'REJECTED']

function countByStatus(items, statuses) {
  return statuses.map((status) => ({
    status: status.replace(/_/g, ' '),
    count: items.filter((i) => i.status === status).length,
  }))
}

export default function AnalyticsDashboard() {
  const [grants, setGrants] = useState([])
  const [proposals, setProposals] = useState([])
  const [disbursements, setDisbursements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [g, p, d] = await Promise.all([
          listGrants({ page_size: 200 }),
          listProposals({ page_size: 200 }),
          listDisbursements({ page_size: 200 }),
        ])
        setGrants(g.results ?? [])
        setProposals(p.results ?? [])
        setDisbursements(d.results ?? [])
      } catch {
        setError('Failed to load analytics data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading analytics...
      </div>
    )
  }

  const grantData = countByStatus(grants, GRANT_STATUSES)
  const proposalData = countByStatus(proposals, PROPOSAL_STATUSES)
  const disbursementData = countByStatus(disbursements, DISBURSEMENT_STATUSES).filter((d) => d.count > 0)

  const totalDisbursedAmount = disbursements
    .filter((d) => d.status === 'DISBURSED')
    .reduce((sum, d) => sum + Number(d.amount || 0), 0)

  const decidedProposals = proposals.filter((p) => ['APPROVED', 'REJECTED'].includes(p.status))
  const approvalRate = decidedProposals.length
    ? Math.round((proposals.filter((p) => p.status === 'APPROVED').length / decidedProposals.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">
          A snapshot of grants, proposals, and disbursements across the system.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Grants" value={grants.length} icon={Award} accent="ocean" />
        <StatCard label="Total Proposals" value={proposals.length} icon={FileText} accent="purple" />
        <StatCard
          label="Total Disbursed"
          value={`$${totalDisbursedAmount.toLocaleString()}`}
          icon={Wallet}
          accent="green"
        />
        <StatCard label="Approval Rate" value={`${approvalRate}%`} icon={TrendingUp} accent="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Grants by Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={grantData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F2" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#21335C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Proposals by Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={proposalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F2" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2E4478" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:col-span-2">
          <h2 className="font-semibold text-slate-800 mb-4">Disbursements by Status</h2>
          {disbursementData.length === 0 ? (
            <p className="text-slate-400 text-sm py-10 text-center">No disbursement records yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={disbursementData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {disbursementData.map((_, i) => (
                    <Cell key={i} fill={OCEAN_SHADES[i % OCEAN_SHADES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}