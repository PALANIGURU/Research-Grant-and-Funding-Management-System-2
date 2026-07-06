// src/pages/Landing.jsx
import { Link } from 'react-router-dom'
import {
  ArrowRight, GraduationCap, FileText, Wallet, BarChart3, Bell, Users,
  ShieldCheck, Clock, TrendingUp,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const MARQUEE_ITEMS = [
  'Grant Opportunities', 'Proposals', 'Budgets & Disbursements',
  'Milestones & Reports', 'Notifications', 'Audit Logs', 'User Management',
]

const MODULES = [
  ['Grant Opportunities', 'Publish, categorize, and manage funding opportunities by agency.', GraduationCap],
  ['Proposals', 'Submit, review, score, and approve research proposals.', FileText],
  ['Budgets & Disbursements', 'Track allocations by category and approve fund releases.', Wallet],
  ['Milestones & Reports', 'Monitor deliverables, progress reports, and final reports.', BarChart3],
  ['Notifications', 'Real-time alerts for approvals, deadlines, and status changes.', Bell],
  ['User Management', 'Role-based access across five distinct user types.', Users],
]

const HIGHLIGHTS = [
  ['Role-Based Security', 'Every user sees exactly what their role allows — nothing more.', ShieldCheck],
  ['Real-Time Visibility', 'Status changes and deadlines reach the right people instantly.', Clock],
  ['Full Auditability', 'Every create, update, and approval is logged and traceable.', TrendingUp],
]

export default function Landing() {
  const { user } = useAuth()
  const loopItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div>
      {/* ---------- Animated Hero ---------- */}
      <section className="relative overflow-hidden bg-ocean-900">
        <div className="hero-blob-1 pointer-events-none absolute -top-24 -right-16 h-96 w-96 rounded-full bg-ocean-600 opacity-40 blur-3xl" />
        <div className="hero-blob-2 pointer-events-none absolute -bottom-32 -left-20 h-[26rem] w-[26rem] rounded-full bg-ocean-700 opacity-50 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          <span className="fade-up inline-block text-xs font-semibold text-ocean-100 bg-white/10 border border-white/15 px-3 py-1 rounded-full mb-5">
            For Universities &amp; Research Organizations
          </span>
          <h1 className="fade-up fade-up-delay-1 text-4xl sm:text-5xl font-bold text-white leading-tight max-w-3xl mx-auto">
            Research Grant &amp; Funding Management, simplified
          </h1>
          <p className="fade-up fade-up-delay-2 mt-5 text-ocean-200 text-lg max-w-2xl mx-auto">
            Replace manual spreadsheets and email chains with one platform for
            grants, proposals, budgets, milestones, and compliance reporting.
          </p>
          <div className="fade-up fade-up-delay-3 mt-8 flex items-center justify-center gap-4">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 bg-white hover:bg-ocean-50 text-ocean-900 font-medium px-6 py-3 rounded-lg transition"
            >
              {user ? 'Go to Dashboard' : 'Create an account'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-white/25 hover:border-white/50 text-white font-medium px-6 py-3 rounded-lg transition"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Scrolling marquee of modules */}
        <div className="relative border-t border-white/10 bg-ocean-950/40 py-4 overflow-hidden">
          <div className="marquee-track">
            {loopItems.map((item, i) => (
              <span
                key={i}
                className="mx-3 shrink-0 inline-flex items-center text-sm text-ocean-200 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full whitespace-nowrap"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Core Modules ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">One Platform, Six Core Modules</h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            Every stage of the grant lifecycle, connected in a single system.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map(([title, desc, Icon]) => (
            <div
              key={title}
              className="bg-white border border-ocean-100 rounded-xl p-6 transition hover:border-ocean-300 hover:shadow-md"
            >
              <div className="h-11 w-11 rounded-lg bg-ocean-900 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-800">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Highlights ---------- */}
      <section className="bg-ocean-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Built for Trust and Transparency</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              Security and accountability at every step of the process.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {HIGHLIGHTS.map(([title, desc, Icon]) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-11 w-11 rounded-lg bg-ocean-100 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-ocean-800" />
                </div>
                <h3 className="font-semibold text-slate-800">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 text-center">
          {[
            ['6', 'Core Modules'],
            ['5', 'User Roles'],
            ['100%', 'Audit Coverage'],
            ['Real-Time', 'Notifications'],
          ].map(([value, label]) => (
            <div key={label} className="bg-white border border-ocean-100 rounded-xl py-8 px-4">
              <p className="text-3xl font-bold text-ocean-900">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="relative overflow-hidden bg-ocean-900">
        <div className="hero-blob-1 pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-ocean-600 opacity-30 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Ready to bring your grant process into one place?
          </h2>
          <p className="mt-4 text-ocean-200 max-w-xl mx-auto">
            Set up your organization and start managing grants, proposals, and budgets today.
          </p>
          <div className="mt-8">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 bg-white hover:bg-ocean-50 text-ocean-900 font-medium px-6 py-3 rounded-lg transition"
            >
              {user ? 'Go to Dashboard' : 'Create an account'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
  
