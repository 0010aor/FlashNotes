import { ColorModeProvider } from '@/components/ui/color-mode'
import { ChakraProvider } from '@chakra-ui/react'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { PostHogProvider } from 'posthog-js/react'
import { useState } from 'react'
import {  OpenAPI } from './client'
import { ApiError } from './client'
import { AuthProvider } from './hooks/useAuthContext'
import { routeTree } from './routeTree.gen'
import { system } from './theme'
import CookieConsent from './components/commonUI/CookieConsentBanner'

OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.TOKEN = async () => {
  return localStorage.getItem('access_token') || ''
}


const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY
const posthogConfig = {
  enabled: import.meta.env.PROD && !!posthogApiKey,
  options: import.meta.env.VITE_POSTHOG_HOST ? { api_host: import.meta.env.VITE_POSTHOG_HOST } : {},
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

const App = () => {
    const [isPosthogEnabled, setIsPosthogEnabled] = useState(false);
    const onConsent=(status:boolean)=>{
        setIsPosthogEnabled(status)
    }
    return (
        <AuthProvider>
            <ChakraProvider value={system}>
            <ColorModeProvider>
                <QueryClientProvider client={queryClient}>
                <CookieConsent consented={isPosthogEnabled} onConsent={onConsent} />
                {isPosthogEnabled && posthogConfig.enabled ? (
                    <PostHogProvider apiKey={posthogApiKey} options={posthogConfig.options}>
                    <RouterProvider router={router} />
                    </PostHogProvider>
                ) : (
                    <RouterProvider router={router} />
                )}
                </QueryClientProvider>
            </ColorModeProvider>
            </ChakraProvider>
        </AuthProvider>
    );
};

export default App;