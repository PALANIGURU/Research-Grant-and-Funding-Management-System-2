// src/pages/public/Services.jsx
import {
  GraduationCap,
  FileText,
  Wallet,
  BarChart3,
  Bell,
  ShieldCheck,
} from 'lucide-react'

const services = [
  {
    icon: GraduationCap,
    title: 'Grant Discovery',
    desc: 'Browse funding agencies and grant categories, and publish new opportunities with eligibility criteria and deadlines.',
  },
  {
    icon: FileText,
    title: 'Proposal Management',
    desc: 'Submit proposals, route them through review, and track status from draft to approval or revision requests.',
  },
  {
    icon: Wallet,
    title: 'Budget & Disbursement Tracking',
    desc: 'Plan project budgets by category, and manage disbursement approvals as funds are released against milestones.',
  },
  {
    icon: BarChart3,
    title: 'Milestones & Reporting',
    desc: 'Track project milestones, collect progress reports, and manage final report submissions in one workflow.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    desc: 'Automatic alerts for approvals, review assignments, upcoming milestone deadlines, and disbursement decisions.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit & Compliance',
    desc: 'Every key action is logged for compliance review, with role-based access limiting who can see or do what.',
  },
]

export default function Services() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-2xl">
        <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-4">
          Services
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Everything needed to run a grants office
        </h1>
        <p className="mt-4 text-slate-500 text-lg">
          One platform covering the entire grant lifecycle — from
          discovering funding opportunities to filing the final compliance
          report.
        </p>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}