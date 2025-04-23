import Navbar from '@/components/commonUI/Navbar'
import { Toaster } from '@/components/ui/toaster'
import { Container } from '@chakra-ui/react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  component: Layout,
  beforeLoad: async () => {
    // NOTE: Direct localStorage access is used here because React context is not available in router guards.
    // For all React components, use useAuthContext() from './hooks/useAuthContext' instead.
    const isGuest = localStorage.getItem('guest_mode') === 'true'
    const isLoggedIn = Boolean(localStorage.getItem('access_token')) || isGuest
    if (!isLoggedIn) {
      throw redirect({
        to: '/login',
      })
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
