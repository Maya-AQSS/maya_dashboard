import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// CSS de librerías PRIMERO: nuestros estilos en index.css y los compartidos
// los sobrescriben (cascada por orden de import).
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './index.css'
import './i18n'
import App from './App'
import { AuthProvider } from '@ceedcv-maya/shared-auth-react'
import { NotificationProvider } from '@ceedcv-maya/shared-sidebar-react'
import { oidcAuthService } from './auth/oidcAdapter'
import { bootstrapRealtime } from './lib/realtimeBootstrap'

bootstrapRealtime()

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

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
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
