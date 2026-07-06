// src/utils/roles.js
// Must stay in sync with accounts/models.py -> UserRole choices on the backend.

export const ROLES = {
  ADMIN: 'ADMIN',
  GRANT_MANAGER: 'GRANT_MANAGER',
  REVIEWER: 'REVIEWER',
  RESEARCHER: 'RESEARCHER',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  CLIENT: 'CLIENT',
}

// Non-admin internal roles that sign in through the Staff portal
export const STAFF_ROLES = [
  ROLES.GRANT_MANAGER,
  ROLES.REVIEWER,
  ROLES.FINANCE_OFFICER,
  ROLES.RESEARCHER,
]

export const ROLE_OPTIONS = [
  { value: 'RESEARCHER', label: 'Researcher / Principal Investigator' },
  { value: 'GRANT_MANAGER', label: 'Grant Manager' },
  { value: 'REVIEWER', label: 'Reviewer' },
  { value: 'FINANCE_OFFICER', label: 'Finance Officer' },
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'CLIENT', label: 'Client' },
]

export const roleLabel = (value) => {
  const found = ROLE_OPTIONS.find((r) => r.value === value)
  return found ? found.label : value
}