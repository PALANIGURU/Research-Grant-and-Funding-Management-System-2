// src/pages/public/Contact.jsx
import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { sendContactMessage } from '../../api/contactService'
import { getErrorMessage } from '../../utils/errors'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await sendContactMessage(form)
      setSubmitted(true)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send your message. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-600 text-sm'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-2xl">
        <span className="inline-block text-xs font-semibold text-ocean-800 bg-ocean-50 px-3 py-1 rounded-full mb-4">
          Contact
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Get in touch
        </h1>
        <p className="mt-4 text-slate-500 text-lg">
          Questions about onboarding your institution, a partnership, or a job
          opening? Send us a message.
        </p>
      </div>

      <div className="mt-12 grid lg:grid-cols-3 gap-10">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-ocean-700 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">Email</p>
              <p className="text-sm text-slate-500">support@rgfms.example</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-ocean-700 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">Phone</p>
              <p className="text-sm text-slate-500">+91 00000 00000</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-ocean-700 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">Office</p>
              <p className="text-sm text-slate-500">Chennai, Tamil Nadu, India</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="border border-green-200 bg-green-50 rounded-xl p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800">Message received</h3>
              <p className="text-sm text-slate-500 mt-1">
                We'll get back to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className={inputClass}
                  />
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
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Subject</label>
                <input
                  name="subject"
                  required
                  value={form.subject}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Message</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-ocean-900 hover:bg-ocean-800 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? 'Sending...' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}