// src/pages/dashboard/contact/ContactMessagesList.jsx
import { useEffect, useState } from 'react'
import { Loader2, Mail, MailOpen } from 'lucide-react'
import { listContactMessages, markContactMessageRead } from '../../../api/contactService'

export default function ContactMessagesList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listContactMessages({ page_size: 100 })
      setItems(data.results ?? data ?? [])
    } catch {
      setError('Failed to load messages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleOpen = async (msg) => {
    const isOpening = expandedId !== msg.id
    setExpandedId(isOpening ? msg.id : null)
    if (isOpening && !msg.is_read) {
      try {
        await markContactMessageRead(msg.id, true)
        setItems((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)))
      } catch {
        // non-fatal
      }
    }
  }

  const unreadCount = items.filter((m) => !m.is_read).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Contact Messages</h1>
        <p className="text-slate-500 text-sm mt-1">
          Messages submitted through the public "Get in touch" form.
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-ocean-100 text-ocean-800">
              {unreadCount} unread
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
            <Mail className="h-8 w-8" />
            <p>No messages yet.</p>
          </div>
        ) : (
          items.map((m) => (
            <div key={m.id}>
              <button
                onClick={() => handleOpen(m)}
                className={`w-full text-left px-5 py-4 flex items-start gap-3 transition hover:bg-ocean-50 ${
                  !m.is_read ? 'bg-ocean-50/60' : ''
                }`}
              >
                {m.is_read ? (
                  <MailOpen className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                ) : (
                  <Mail className="h-4 w-4 text-ocean-700 mt-1 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm ${!m.is_read ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
                      {m.subject}
                    </p>
                    <span className="text-xs text-slate-400">
                      {m.name} · {m.email}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              </button>
              {expandedId === m.id && (
                <div className="px-5 pb-4 pl-12 text-sm text-slate-600 whitespace-pre-line">
                  {m.message}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}