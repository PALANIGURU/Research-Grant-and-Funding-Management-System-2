// src/pages/auth/ClientLogin.jsx
import { UserRound } from 'lucide-react'
import LoginForm from '../../components/auth/LoginForm'
import { ROLES } from '../../utils/roles'

export default function ClientLogin() {
  return (
    <LoginForm
      title="Client Login"
      subtitle="Sign in to submit and track your grant applications."
      icon={UserRound}
      validate={(profile) => profile.role === ROLES.CLIENT}
      deniedMessage="This portal is for Client accounts only. Staff and admins should use the Admin Login."
      redirectTo="/dashboard"
      registerHref="/register"
      footerHint="For grant applicants and external clients"
    />
  )
}