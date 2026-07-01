// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicLayout from './components/layout/PublicLayout'

import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import About from './pages/public/About'
import Services from './pages/public/Services'
import Team from './pages/public/Team'
import Careers from './pages/public/Careers'
import Contact from './pages/public/Contact'
import PrivacyPolicy from './pages/public/PrivacyPolicy'
import TermsAndConditions from './pages/public/TermsAndConditions'

// Temporary placeholder until we build the real dashboard in the next step
function DashboardPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-xl text-slate-600">Dashboard coming next 🚧</p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      {/* Public pages share the navbar + footer via PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPlaceholder />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App