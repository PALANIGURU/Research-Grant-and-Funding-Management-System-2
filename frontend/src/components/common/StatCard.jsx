// src/components/common/StatCard.jsx
export default function StatCard({ label, value, icon: Icon, accent = 'blue' }) {
  const accents = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    purple: 'bg-purple-50 text-purple-700',
    red: 'bg-red-50 text-red-700',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
      {Icon && (
        <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      )}
    </div>
  )
}