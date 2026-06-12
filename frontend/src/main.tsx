import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { withTranslation } from 'react-i18next'
// CSS de librerías PRIMERO: nuestros estilos en index.css y los compartidos
// los sobrescriben (cascada por orden de import).
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './index.css'
import './i18n'
import { MayaProviders } from '@ceedcv-maya/shared-layout-react'
import { ErrorBoundary } from '@ceedcv-maya/shared-ui-react'
import App from './App'
import { fetchMe } from './api/auth'
import { oidcAuthService } from './auth/oidcAdapter'
import { ErrorFallback } from './components/ErrorFallback'
import { FavoritesProvider } from './features/favorites/context/FavoritesContext'

// MayaProviders monta: QueryClientProvider, AuthProvider, BrowserRouter,
// UserProfileProvider(fetchMe), NotificationProvider, ToastProvider (withToasts),
// bootstrapRealtime('dashboard') y el logger de unhandledrejection.
//
// withErrorBoundary={false}: el dashboard conserva su boundary propio con
// ErrorFallback reactivo a idioma (ver src/components/ErrorFallback.tsx).
// El ErrorBoundary compartido espera las props del HOC withTranslation.
const TranslatedErrorBoundary = withTranslation('common')(ErrorBoundary)

function ExtraProviders({ children }: { children: ReactNode }) {
  return <FavoritesProvider>{children}</FavoritesProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TranslatedErrorBoundary fallback={<ErrorFallback />}>
      <MayaProviders
        authService={oidcAuthService}
        serviceSlug="dashboard"
        fetchProfile={fetchMe}
        extraProviders={ExtraProviders}
        withToasts
        withErrorBoundary={false}
      >
        <App />
      </MayaProviders>
    </TranslatedErrorBoundary>
  </StrictMode>,
)
