// src/pages/public/Careers.jsx
import { useState } from 'react'
import { MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react'

const jobs = [
  {
    title: 'Full Stack Developer',
    location: 'Remote / Chennai',
    type: 'Full-time',
    desc: 'Work across our Django REST API and React frontend, building features for grant and proposal workflows.',
  },
  {
    title: 'Product Designer',
    location: 'Remote',
    type: 'Full-time',
    desc: 'Design dashboards and forms used daily by research administrators, reviewers, and finance officers.',
  },
  {
    title: 'Customer Success Associate',
    location: 'Chennai, India',
    type: 'Full-time',
    desc: 'Onboard university partners and help grants offices migrate from spreadsheets to the platform.',
  },
]

const process = [
  { step: '1', title: 'Application Review', desc: 'We review your resume and portfolio/GitHub within 3-5 business days.' },
  { step: '2', title: 'Screening Call', desc: 'A 30-minute call with our hiring team about your background and the role.' },
  { step: '3', title: 'Technical / Role Interview', desc: 'A practical exercise or case study relevant to the position.' },
  { step: '4', title: 'Final Interview', desc: 'Meet the team and discuss expectations, compensation, and start date.' },
]

export default function Careers() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-2xl">
        <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-4">
          Careers
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Help us build better tools for research funding
        </h1>
        <p className="mt-4 text-slate-500 text-lg">
          We're a small, remote-friendly team. Here's what's open right now.
        </p>
      </div>

      <div className="mt-12 space-y-4">
        {jobs.map((job, i) => (
          <div
            key={job.title}
            className="border border-slate-200 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition"
            >
              <div>
                <h3 className="font-semibold text-slate-800">{job.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {job.type}
                  </span>
                </div>
              </div>
              {openIndex === i ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 text-sm text-slate-500 border-t border-slate-100 pt-4">
                {job.desc}
                <div className="mt-4">
                  <a href="/contact" className="inline-block text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                    Apply via Contact page
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">
          Our interview process
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {process.map((p) => (
            <div key={p.step} className="border border-slate-200 rounded-xl p-6">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center mb-4">
                {p.step}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{p.title}</h3>
              <p className="text-sm text-slate-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
