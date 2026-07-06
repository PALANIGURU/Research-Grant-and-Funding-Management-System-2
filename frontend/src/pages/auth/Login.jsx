// src/pages/auth/Login.jsx
// src/pages/auth/Login.jsx
import { Link } from 'react-router-dom'
import { UserRound, ArrowRight } from 'lucide-react'

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

export default function Login() {
  return (
    <div className="min-h-screen relative overflow-hidden gradient-mesh flex items-center justify-center px-4 py-16">
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

      <div className="relative w-full max-w-md fade-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Sign in</h1>
          <p className="text-ocean-200 mt-2">
            Access your RGFMS account.
          </p>
        </div>

        <Link
          to="/login/client"
          className="group block bg-white/95 backdrop-blur border border-white/20 rounded-xl p-6 transition hover:bg-white hover:shadow-xl"
        >
          <div className="h-11 w-11 rounded-lg bg-ocean-900 flex items-center justify-center mb-4">
            <UserRound className="h-5 w-5 text-white" />
          </div>
          <h2 className="font-semibold text-slate-800">Client Login</h2>
          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
            For grant applicants and external clients tracking proposals and funding.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ocean-700 group-hover:gap-2 transition-all">
            Continue <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <p className="text-sm text-ocean-200 mt-8 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}