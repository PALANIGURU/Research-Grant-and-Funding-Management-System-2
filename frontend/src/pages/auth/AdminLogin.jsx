// src/pages/auth/AdminLogin.jsx
import { Building2 } from 'lucide-react'
import LoginForm from '../../components/auth/LoginForm'
import { ROLES } from '../../utils/roles'

export default function AdminLogin() {
  return (
    <LoginForm
      title="Admin Login"
      subtitle="Sign in to the administrator dashboard."
      icon={Building2}
      validate={(profile) => profile.role === ROLES.ADMIN}
      deniedMessage="This portal is for Administrator accounts only. Other staff should use the Staff Login."
      redirectTo="/dashboard"
      footerHint="Administrators only"
    />
  )
}