// src/pages/dashboard/users/UsersList.jsx
import { useEffect, useState } from 'react'
import { Loader2, Search, UserPlus, X } from 'lucide-react'
import { listUsers, updateUser, createUser } from '../../../api/usersService'
import { ROLE_OPTIONS, roleLabel } from '../../../utils/roles'
import { getErrorMessage, getFieldErrors } from '../../../utils/errors'

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'RESEARCHER',
  department: '',
  institution: '',
}

export default function UsersList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page_size: 100 }
      if (search) params.search = search
      const data = await listUsers(params)
      setItems(data.results ?? [])
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleRoleChange = async (id, role) => {
    try {
      await updateUser(id, { role })
      setItems((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
    } catch {
      setError('Failed to update role.')
    }
  }

  const handleToggleActive = async (id, is_active) => {
    try {
      await updateUser(id, { is_active: !is_active })
      setItems((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: !is_active } : u))
      )
    } catch {
      setError('Failed to update user status.')
    }
  }

  const openModal = () => {
    setForm(emptyForm)
    setFormErrors({})
    setShowModal(true)
  }

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setFormErrors({})
    try {
      await createUser(form)
      setShowModal(false)
      load()
    } catch (err) {
      const fields = getFieldErrors(err)
      if (Object.keys(fields).length > 0) {
        setFormErrors(fields)
      } else {
        setFormErrors({ non_field_errors: [getErrorMessage(err, 'Failed to create user.')] })
      }
    } finally {
      setCreating(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-600 text-sm'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  const errorFor = (field) =>
    formErrors[field] ? (
      <p className="text-red-600 text-xs mt-1">{formErrors[field][0]}</p>
    ) : null

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage roles and access for all users in the system.
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 bg-ocean-900 hover:bg-ocean-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <UserPlus className="h-4 w-4" />
          New Staff User
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-600"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ocean-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin inline" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No users found.
                </td>
              </tr>
            ) : (
              items.map((u) => (
                <tr key={u.id} className="hover:bg-ocean-50">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ocean-600"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(u.id, u.is_active)}
                      className="text-xs text-ocean-700 hover:underline"
                    >
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 mb-1">New Staff User</h2>
            <p className="text-slate-500 text-sm mb-5">
              Create an internal account with a specific role. This is separate
              from public client registration.
            </p>

            {formErrors.non_field_errors && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
                {formErrors.non_field_errors[0]}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First name</label>
                  <input
                    name="first_name"
                    required
                    value={form.first_name}
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
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
                  onChange={handleFormChange}
                  className={inputClass}
                />
                {errorFor('email')}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Temporary password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                  {errorFor('password')}
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Institution</label>
                  <input
                    name="institution"
                    value={form.institution}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleFormChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 bg-ocean-900 hover:bg-ocean-800 disabled:bg-ocean-300 text-white font-medium py-2.5 rounded-lg text-sm transition"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {creating ? 'Creating...' : 'Create staff account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}