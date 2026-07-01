// src/components/layout/PublicFooter.jsx
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">RGFMS</span>
          </div>
          <p className="text-sm text-slate-500">
            Research Grant &amp; Funding Management System — built for
            universities and research organizations.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link to="/about" className="hover:text-blue-600">About</Link></li>
            <li><Link to="/team" className="hover:text-blue-600">Team</Link></li>
            <li><Link to="/careers" className="hover:text-blue-600">Careers</Link></li>
            <li><Link to="/contact" className="hover:text-blue-600">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link to="/services" className="hover:text-blue-600">Services</Link></li>
            <li><Link to="/register" className="hover:text-blue-600">Get started</Link></li>
            <li><Link to="/login" className="hover:text-blue-600">Sign in</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link to="/privacy-policy" className="hover:text-blue-600">Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions" className="hover:text-blue-600">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-5">
        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Research Grant &amp; Funding Management System. All rights reserved.
        </p>
      </div>
    </footer>
  )
}