// src/pages/public/Contact.jsx
import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    // NOTE: no backend endpoint for this yet — wire this up to a real
    // /api/contact/ endpoint later if you want emails to actually send.
    setSubmitted(true)
  }

  const inputClass =
    'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-2xl">
        <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-4">
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
            <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">Email</p>
              <p className="text-sm text-slate-500">support@rgfms.example</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-800">Phone</p>
              <p className="text-sm text-slate-500">+91 00000 00000</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
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
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition"
              >
                <Send className="h-4 w-4" />
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}