import { UsersService } from '@/client'
import type React from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

const GUEST_MODE_KEY = 'guest_mode'
const ACCESS_TOKEN_KEY = 'access_token'

interface AuthContextType {
  isGuest: boolean
  isLoggedIn: boolean
  setGuestMode: (value: boolean) => void
  logout: () => Promise<void>
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
    const checkUser = async () => {
      if (localStorage.getItem(GUEST_MODE_KEY) === 'true') {
        setIsLoggedIn(true)
        return
      }

      try {
        const user = await UsersService.readUserMe()
        if (user) {
          setIsLoggedIn(true)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    console.log('AuthProvider mounted')
    const handleStorage = (e: StorageEvent) => {
      console.log('Storage event:', e.key)
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

  const logout = async () => {
    try {
      await fetch('http://localhost:8000/api/v1/auth0/logout', {
        method: 'GET',
        credentials: 'include',
      })
    } catch (e) {
      console.error('Logout request failed', e)
    }
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
