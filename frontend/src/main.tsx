import './i18n'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { ChakraProvider } from '@chakra-ui/react'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ApiError, OpenAPI } from './client'
import AnalyticsConsent from './components/commonUI/AnalyticsConsent'
import { AuthProvider } from './hooks/useAuthContext'
import { routeTree } from './routeTree.gen'
import { system } from './theme'

OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.TOKEN = async () => {
  return localStorage.getItem('access_token') || ''
}

const handleApiError = (error: Error) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    localStorage.removeItem('access_token')
    window.location.href = '/login'
  }
}
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <AuthProvider>
        <ChakraProvider value={system}>
          <ColorModeProvider>
            <AnalyticsConsent />
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
            </QueryClientProvider>
          </ColorModeProvider>
        </ChakraProvider>
      </AuthProvider>
    </StrictMode>,
  )
}
