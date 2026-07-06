// src/pages/auth/SuperAdminLogin.jsx
import { ShieldCheck } from 'lucide-react'
import LoginForm from '../../components/auth/LoginForm'

export default function SuperAdminLogin() {
  return (
    <LoginForm
      title="Super Admin Login"
      subtitle="Elevated access for system owners and platform operators."
      icon={ShieldCheck}
      validate={(profile) => profile.is_superuser === true}
      deniedMessage="This portal requires super admin privileges. Use the Admin Login if you have a regular administrator account."
      redirectTo="/dashboard"
      footerHint="Restricted access — superuser accounts only"
    />
  )
}