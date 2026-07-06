// src/utils/errors.js
// Backend wraps every error response as:
//   { success: false, error: { code, message, details } }
// This helper extracts a human-readable message regardless of exact shape,
// so forms don't need to guess the response structure themselves.

export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data

  if (!data) return fallback

  // Custom backend format: { success: false, error: { code, message, details } }
  if (data.error) {
    const { message, details } = data.error

    // Prefer field-level details if present (more specific than the summary message)
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      const fieldMessages = Object.entries(details)
        .filter(([key]) => key !== 'detail')
        .map(([field, errors]) => {
          const text = Array.isArray(errors) ? errors.join(', ') : String(errors)
          return `${field}: ${text}`
        })
      if (fieldMessages.length) return fieldMessages.join(' | ')
    }

    if (message) return message
  }

  // DRF default format: { detail: '...' }
  if (data.detail) return data.detail

  // Fallback: flat field-error dict, e.g. { title: ['This field is required.'] }
  if (typeof data === 'object') {
    const messages = Object.values(data)
      .flat()
      .filter((v) => typeof v === 'string')
    if (messages.length) return messages.join(' ')
  }

  return fallback
}
// Returns a flat { field: 'message' } map for forms that display errors
// per-input (e.g. Register.jsx). Falls back to an empty object when the
// backend only returned a general message rather than field-level detail.
export function getFieldErrors(err) {
  const data = err?.response?.data

  if (data?.error?.details && typeof data.error.details === 'object' && !Array.isArray(data.error.details)) {
    const { detail, ...fields } = data.error.details
    return fields
  }

  // Already-flat shape (older/other endpoints)
  if (data && typeof data === 'object' && !data.error && !data.success) {
    return data
  }

  return {}
}