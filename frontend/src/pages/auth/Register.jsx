// src/pages/auth/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLE_OPTIONS } from '../../utils/roles'

const initialForm = {
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password_confirm: '',
  role: 'RESEARCHER',
  phone: '',
  department: '',
  institution: '',
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')
    setFieldErrors({})
    setSubmitting(true)
    try {
      await register(form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        setFieldErrors(data)
      } else {
        setGeneralError('Registration failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const errorFor = (field) =>
    fieldErrors[field] ? (
      <p className="text-red-600 text-xs mt-1">{fieldErrors[field][0]}</p>
    ) : null

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 border border-slate-200 text-center">
          <h1 className="text-xl font-bold text-green-600 mb-2">
            Account created!
          </h1>
          <p className="text-slate-500 text-sm">Redirecting you to sign in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8 border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Create an account</h1>
        <p className="text-slate-500 mb-6 text-sm">
          Register for the Research Grant & Funding Management System
        </p>

        {generalError && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First name</label>
              <input
                name="first_name"
                required
                value={form.first_name}
                onChange={handleChange}
                className={inputClass}
              />
              {errorFor('first_name')}
            </div>
            <div>
              <label className={labelClass}>Last name</label>
              <input
                name="last_name"
                required
                value={form.last_name}
                onChange={handleChange}
                className={inputClass}
              />
              {errorFor('last_name')}
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="you@institution.edu"
            />
            {errorFor('email')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className={inputClass}
              />
              {errorFor('password')}
            </div>
            <div>
              <label className={labelClass}>Confirm password</label>
              <input
                type="password"
                name="password_confirm"
                required
                value={form.password_confirm}
                onChange={handleChange}
                className={inputClass}
              />
              {errorFor('password_confirm')}
            </div>
          </div>

          <div>
            <label className={labelClass}>Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={inputClass}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {errorFor('role')}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Institution</label>
              <input
                name="institution"
                value={form.institution}
                onChange={handleChange}
                className={inputClass}
              />
              {errorFor('institution')}
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className={inputClass}
              />
              {errorFor('department')}
            </div>
          </div>

          <div>
            <label className={labelClass}>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={inputClass}
              placeholder="+91XXXXXXXXXX"
            />
            {errorFor('phone')}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg text-sm transition"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}