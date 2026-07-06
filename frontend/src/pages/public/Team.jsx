// src/pages/public/Team.jsx
import { Link2, Mail } from 'lucide-react'

const team = [
  {
    name: 'PALANI GURU K',
    role: 'Founder & Product Lead',
    initials: 'AS',
    bio: 'Former research administrator focused on simplifying grant compliance workflows.',
  },
  {
    name: 'BHARATH S',
    role: 'Engineering Lead',
    initials: 'RM',
    bio: 'Leads backend architecture, security, and API design for the platform.',
  },
  {
    name: 'ASHILA SHAFFIN',
    role: 'Product Designer',
    initials: 'PN',
    bio: 'Designs the dashboards and workflows researchers and admins use daily.',
  },
  {
    name: 'DEEPAK MANI',
    role: 'Customer Success',
    initials: 'KI',
    bio: 'Works with university partners to onboard grants offices smoothly.',
  },
 {
    name: 'LITESSH S',
    role: 'Support Executive',
    initials: 'NG',
    bio: 'Provides technical support and resolves user issues to ensure a seamless experience.',
  }
]

export default function Team() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="max-w-2xl">
        <span className="inline-block text-xs font-semibold text-ocean-800 bg-ocean-50 px-3 py-1 rounded-full mb-4">
          Our Team
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          The people behind the platform
        </h1>
        <p className="mt-4 text-slate-500 text-lg">
          A small team of engineers, designers, and former research
          administrators building tools we wish we'd had.
        </p>
      </div>

      <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {team.map((member) => (
          <div
            key={member.name}
            className="border border-slate-200 rounded-xl p-6 text-center hover:shadow-md transition"
          >
            <div className="h-16 w-16 mx-auto rounded-full bg-ocean-700 text-white flex items-center justify-center text-lg font-semibold mb-4">
              {member.initials}
            </div>
            <h3 className="font-semibold text-slate-800">{member.name}</h3>
            <p className="text-xs text-ocean-700 font-medium mb-2">{member.role}</p>
            <p className="text-sm text-slate-500">{member.bio}</p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Link2 className="h-4 w-4 text-slate-400 hover:text-ocean-700 cursor-pointer" />
              <Mail className="h-4 w-4 text-slate-400 hover:text-ocean-700 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}