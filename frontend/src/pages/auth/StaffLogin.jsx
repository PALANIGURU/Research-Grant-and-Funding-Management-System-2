// src/pages/auth/StaffLogin.jsx
import { Users } from 'lucide-react'
import LoginForm from '../../components/auth/LoginForm'
import { STAFF_ROLES } from '../../utils/roles'

export default function StaffLogin() {
  return (
    <LoginForm
      title="Staff Login"
      subtitle="Sign in to manage grants, proposals, budgets, and reports."
      icon={Users}
      validate={(profile) => STAFF_ROLES.includes(profile.role)}
      deniedMessage="This portal is for Grant Managers, Reviewers, Finance Officers, and Researchers. Administrators should use the Admin Login."
      redirectTo="/dashboard"
      footerHint="For Grant Managers, Reviewers, Finance Officers & Researchers"
    />
  )
}