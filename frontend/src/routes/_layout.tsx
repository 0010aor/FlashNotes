import Navbar from '@/components/commonUI/Navbar'
import { Toaster } from '@/components/ui/toaster'
import { Container } from '@chakra-ui/react'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { isLoggedIn } from '../hooks/useAuth'

export const Route = createFileRoute('/_layout')({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
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
