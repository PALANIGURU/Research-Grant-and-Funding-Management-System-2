// src/pages/public/About.jsx
import { Target, Users, Sparkles, Globe2 } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: 'Our Mission',
    desc: 'To help universities and research organizations manage grants, budgets, and compliance without the chaos of spreadsheets and scattered emails.',
  },
  {
    icon: Users,
    title: 'Who We Serve',
    desc: 'Grant managers, principal investigators, reviewers, finance officers, and research administrators, all working from a single source of truth.',
  },
  {
    icon: Sparkles,
    title: 'What Sets Us Apart',
    desc: 'Purpose-built workflows for proposal review, milestone tracking, and disbursement approvals, rather than a generic project management tool bent to fit.',
  },
  {
    icon: Globe2,
    title: 'Our Reach',
    desc: 'Designed to scale from a single department to an entire institution managing dozens of active grants and funding agencies at once.',
  },
]

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-2xl">
        <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-4">
          About Us
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Built to make research funding easier to manage
        </h1>
        <p className="mt-4 text-slate-500 text-lg">
          The Research Grant &amp; Funding Management System was created to
          replace manual tracking of grants, approvals, and reporting
          obligations with a single connected platform — from the moment a
          grant opportunity opens to the day a final report is filed.
        </p>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 gap-6">
        {values.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 border-t border-slate-200 pt-10 grid sm:grid-cols-3 gap-8 text-center">
        <div>
          <p className="text-3xl font-bold text-blue-600">5</p>
          <p className="text-sm text-slate-500 mt-1">User roles supported</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-blue-600">End-to-end</p>
          <p className="text-sm text-slate-500 mt-1">Grant lifecycle coverage</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-blue-600">Secure</p>
          <p className="text-sm text-slate-500 mt-1">JWT-based access control</p>
        </div>
      </div>
    </div>
  )
}