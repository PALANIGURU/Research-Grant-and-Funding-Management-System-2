// src/pages/Landing.jsx
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { user } = useAuth()

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-4">
          For Universities & Research Organizations
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight max-w-3xl mx-auto">
          Research Grant &amp; Funding Management, simplified
        </h1>
        <p className="mt-5 text-slate-500 text-lg max-w-2xl mx-auto">
          Replace manual spreadsheets and email chains with one platform for
          grants, proposals, budgets, milestones, and compliance reporting.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to={user ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
          >
            {user ? 'Go to Dashboard' : 'Create an account'}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {!user && (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-6 py-3 rounded-lg transition"
            >
              Sign in
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}