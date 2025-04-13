import './i18n'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { PostHogProvider } from 'posthog-js/react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { OpenAPI } from './client'
import { routeTree } from './routeTree.gen'
import { system } from './theme'

OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.TOKEN = async () => {
  return localStorage.getItem('access_token') || ''
}

const queryClient = new QueryClient()

const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY
const posthogConfig = {
  enabled: import.meta.env.PROD && !!posthogApiKey,
  options: import.meta.env.VITE_POSTHOG_HOST ? { api_host: import.meta.env.VITE_POSTHOG_HOST } : {},
}

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
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <QueryClientProvider client={queryClient}>
            {posthogConfig.enabled ? (
              <PostHogProvider apiKey={posthogApiKey} options={posthogConfig.options}>
                <RouterProvider router={router} />
              </PostHogProvider>
            ) : (
              <RouterProvider router={router} />
            )}
          </QueryClientProvider>
        </ColorModeProvider>
      </ChakraProvider>
    </StrictMode>,
  )
}
