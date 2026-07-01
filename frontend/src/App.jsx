// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'

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

import Overview from './pages/dashboard/Overview'
import GrantsList from './pages/dashboard/grants/GrantsList'
import GrantForm from './pages/dashboard/grants/GrantForm'
import GrantDetail from './pages/dashboard/grants/GrantDetail'
import ProposalsList from './pages/dashboard/proposals/ProposalsList'
import ProposalForm from './pages/dashboard/proposals/ProposalForm'
import ProposalDetail from './pages/dashboard/proposals/ProposalDetail'
import BudgetsList from './pages/dashboard/budgets/BudgetsList'
import BudgetForm from './pages/dashboard/budgets/BudgetForm'
import BudgetDetail from './pages/dashboard/budgets/BudgetDetail'

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

      {/* Authenticated dashboard area */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />

        <Route path="grants" element={<GrantsList />} />
        <Route path="grants/new" element={<GrantForm />} />
        <Route path="grants/:id/edit" element={<GrantForm />} />
        <Route path="grants/:id" element={<GrantDetail />} />

        <Route path="proposals" element={<ProposalsList />} />
        <Route path="proposals/new" element={<ProposalForm />} />
        <Route path="proposals/:id/edit" element={<ProposalForm />} />
        <Route path="proposals/:id" element={<ProposalDetail />} />

        <Route path="budgets" element={<BudgetsList />} />
        <Route path="budgets/new" element={<BudgetForm />} />
        <Route path="budgets/:id" element={<BudgetDetail />} />
        {/* More nested routes (reports, notifications, users, audit) will be added next */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
