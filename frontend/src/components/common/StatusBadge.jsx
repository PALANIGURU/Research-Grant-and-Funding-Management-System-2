// src/components/common/StatusBadge.jsx
const COLOR_MAP = {
  DRAFT: 'bg-ocean-100 text-ocean-700',
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-ocean-100 text-ocean-700',
  AWARDED: 'bg-ocean-200 text-ocean-800',
  COMPLETED: 'bg-ocean-200 text-ocean-800',
  CANCELLED: 'bg-red-100 text-red-700',
  SUBMITTED: 'bg-amber-100 text-amber-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVISION_REQUESTED: 'bg-orange-100 text-orange-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

export default function StatusBadge({ status }) {
  const classes = COLOR_MAP[status] || 'bg-ocean-100 text-ocean-700'
  const label = status ? status.replace(/_/g, ' ') : 'UNKNOWN'

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  )
}