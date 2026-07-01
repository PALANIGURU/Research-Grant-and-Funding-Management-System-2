// src/components/common/StatusBadge.jsx
const COLOR_MAP = {
  DRAFT: 'bg-slate-100 text-slate-600',
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-600',
  AWARDED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
  SUBMITTED: 'bg-amber-100 text-amber-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVISION_REQUESTED: 'bg-orange-100 text-orange-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
}

export default function StatusBadge({ status }) {
  const classes = COLOR_MAP[status] || 'bg-slate-100 text-slate-600'
  const label = status ? status.replace(/_/g, ' ') : 'UNKNOWN'

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  )
}