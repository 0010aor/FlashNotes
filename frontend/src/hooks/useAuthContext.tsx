import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

const GUEST_MODE_KEY = 'guest_mode'
const ACCESS_TOKEN_KEY = 'access_token'

interface AuthContextType {
  isGuest: boolean
  isLoggedIn: boolean
  setGuestMode: (value: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_MODE_KEY) === 'true')
  const [isLoggedIn, setIsLoggedIn] = useState(
    () =>
      Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)) ||
      localStorage.getItem(GUEST_MODE_KEY) === 'true',
  )

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === GUEST_MODE_KEY || e.key === ACCESS_TOKEN_KEY) {
        setIsGuest(localStorage.getItem(GUEST_MODE_KEY) === 'true')
        setIsLoggedIn(
          Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)) ||
            localStorage.getItem(GUEST_MODE_KEY) === 'true',
        )
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const setGuestMode = (value: boolean) => {
    if (value) {
      localStorage.setItem(GUEST_MODE_KEY, 'true')
    } else {
      localStorage.removeItem(GUEST_MODE_KEY)
    }
    setIsGuest(value)
    setIsLoggedIn(value || Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)))
  }

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    setGuestMode(false)
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isGuest, isLoggedIn, setGuestMode, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}

export { AuthProvider, useAuthContext }
