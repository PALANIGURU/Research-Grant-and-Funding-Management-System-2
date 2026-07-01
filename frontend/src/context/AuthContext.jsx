// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, registerUser, fetchProfile } from '../api/authService'
import { setTokens, setUser, getUser, getAccessToken, clearAuth } from '../utils/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setCurrentUser] = useState(getUser())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // On app load, if a token exists, verify it by pulling the latest profile
  useEffect(() => {
    const init = async () => {
      const token = getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const profile = await fetchProfile()
        setUser(profile)
        setCurrentUser(profile)
      } catch {
        clearAuth()
        setCurrentUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (email, password) => {
    setError(null)
    const data = await loginUser(email, password)
    setTokens(data.access, data.refresh)
    const profile = await fetchProfile()
    setUser(profile)
    setCurrentUser(profile)
    return profile
  }

  const register = async (payload) => {
    setError(null)
    return registerUser(payload)
  }

  const logout = () => {
    clearAuth()
    setCurrentUser(null)
  }

  const value = { user, loading, error, login, register, logout, setCurrentUser }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)