import { UsersService } from '@/client'
import Navbar from '@/components/commonUI/Navbar'
import { Toaster } from '@/components/ui/toaster'
import { Container } from '@chakra-ui/react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  component: Layout,
  beforeLoad: async () => {
    const isGuest = localStorage.getItem('guest_mode') === 'true'
    if (isGuest) {
      return
    }
    try {
      const user = await UsersService.readUserMe()
      if (!user) {
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
