// src/components/auth/LoginForm.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Mail, Lock, LogIn, Loader2, ShieldAlert, GraduationCap,
  CheckCircle2, ShieldCheck, Clock,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../utils/errors'

const VALUE_PROPS = [
  ['Role-based security', ShieldCheck],
  ['Real-time visibility', Clock],
  ['Full audit trail', CheckCircle2],
]
const PARTICLES = [
  { left: 6, size: 4, delay: 0, duration: 9, drift: 12 },
  { left: 14, size: 3, delay: 2, duration: 11, drift: -18 },
  { left: 22, size: 5, delay: 4, duration: 8, drift: 20 },
  { left: 30, size: 3, delay: 1, duration: 12, drift: -10 },
  { left: 38, size: 4, delay: 5, duration: 10, drift: 15 },
  { left: 47, size: 3, delay: 3, duration: 9, drift: -20 },
  { left: 55, size: 5, delay: 0.5, duration: 13, drift: 8 },
  { left: 63, size: 3, delay: 6, duration: 10, drift: -14 },
  { left: 71, size: 4, delay: 2.5, duration: 11, drift: 18 },
  { left: 78, size: 3, delay: 4.5, duration: 9, drift: -8 },
  { left: 85, size: 5, delay: 1.5, duration: 12, drift: 22 },
  { left: 92, size: 3, delay: 7, duration: 8, drift: -16 },
]

/**
 * Shared login form used by all three portals (Client, Admin, Super Admin).
 * Split-screen layout: branded Ocean panel + form panel.
 */
export default function LoginForm({
  title,
  subtitle,
  icon: Icon = LogIn,
  validate,
  deniedMessage = 'Your account does not have access to this portal.',
  redirectTo = '/dashboard',
  registerHref,
  footerHint,
}) {
  const { login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const profile = await login(form.email, form.password)

      if (validate && !validate(profile)) {
        logout()
        setError(deniedMessage)
        return
      }

      const from = location.state?.from?.pathname
      navigate(from || redirectTo, { replace: true })
    } catch (err) {
      if (!err.response) {
        setError("Can't reach the server. Please check your connection and try again.")
      } else if (err.response.status === 401) {
        setError('Invalid email or password. Please try again.')
      } else {
        setError(getErrorMessage(err, 'Something went wrong. Please try again.'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* ---------- Branded panel ---------- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-mesh flex-col justify-between p-12">
        <div className="hero-blob-1 pointer-events-none absolute -top-24 -right-16 h-96 w-96 rounded-full bg-ocean-600 opacity-30 blur-3xl" />
        <div className="hero-blob-2 pointer-events-none absolute -bottom-32 -left-20 h-[26rem] w-[26rem] rounded-full bg-ocean-700 opacity-40 blur-3xl" />

        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--drift': `${p.drift}px`,
            }}
          />
        ))}

        <div className="relative flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gold flex items-center justify-center" style={{ backgroundColor: '#C9A227' }}>
            <GraduationCap className="h-5 w-5 text-ocean-900" />
          </div>
          <span className="font-bold text-white tracking-wide">RGFMS</span>
        </div>

        <div className="relative fade-up">
          <h2 className="text-3xl font-bold text-white leading-tight max-w-sm">
            Research Grant &amp; Funding Management, in one place.
          </h2>
          <p className="mt-4 text-ocean-200 max-w-sm">
            Grants, proposals, budgets, milestones, and compliance — all
            connected, all traceable.
          </p>

          <div className="mt-8 space-y-3">
            {VALUE_PROPS.map(([label, VIcon]) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <VIcon className="h-4 w-4 text-ocean-100" />
                </div>
                <span className="text-sm text-ocean-100">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-ocean-300">
          © {new Date().getFullYear()} RGFMS. All rights reserved.
        </p>
      </div>

      {/* ---------- Form panel ---------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-ocean-50">
        <div className="w-full max-w-sm fade-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-lg bg-ocean-900 flex items-center justify-center shrink-0 lg:hidden">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          </div>
          <p className="text-slate-500 mb-6 text-sm">{subtitle}</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent text-sm transition"
                  placeholder="you@institution.edu"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ocean-600 focus:border-transparent text-sm transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-ocean-900 hover:bg-ocean-800 disabled:bg-ocean-300 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {registerHref && (
            <p className="text-sm text-slate-500 mt-6 text-center">
              Don't have an account?{' '}
              <Link to={registerHref} className="text-ocean-700 font-medium hover:underline">
                Create one
              </Link>
            </p>
          )}

          {footerHint && (
            <p className="text-xs text-slate-400 mt-4 text-center">{footerHint}</p>
          )}

          <p className="text-xs text-slate-400 mt-4 text-center">
            <Link to="/login" className="hover:underline">
              ← Choose a different portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
