import Navbar from '@/components/commonUI/Navbar'
import { Toaster } from '@/components/ui/toaster'
import { Container } from '@chakra-ui/react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  component: Layout,
  beforeLoad: async () => {
    // ✅ Auth check using backend session-aware endpoint
    try {
      const res = await fetch('http://localhost:8000/api/v1/users/me', {
        credentials: 'include', // 🔒 Required to send session cookie
      })

      console.log("res:", res)

      const data = await res.json()
      console.log("data:", data)
      const isLoggedIn = data?.email != null
      const isGuest = localStorage.getItem('guest_mode') === 'true'
    
      if (!isLoggedIn && !isGuest) {
        console.log("Not logged in or guest")
        throw redirect({ to: '/login' })
      }
    } catch (err) {
      console.error('Failed to check auth state:', err)
      throw redirect({ to: '/login' })
    }
  },
})

function Layout() {
  return (
    <>
      <Container pt="4rem">
        <Navbar />
        <Outlet />
      </Container>
      <Toaster />
    </>
  )
}
