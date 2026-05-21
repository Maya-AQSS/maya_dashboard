import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './i18n'
import App from './App'
import { AuthProvider } from '@maya/shared-auth-react'
import { oidcAuthService } from './auth/oidcAdapter'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider keycloak={oidcAuthService.keycloak} enableLogging={import.meta.env.DEV}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
