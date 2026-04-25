import { useEffect } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import AppRouter from './router'
import { FavoritesProvider } from '../features/favorites/context/FavoritesContext'
import { TopbarActionsProvider } from '../shared/context/TopbarActionsContext'
import { ToastProvider } from '../shared/context/ToastContext'

// ── SSO return_to handler ─────────────────────────────────────────────────────
// Las apps server-rendered (ej: maya_logs) no pueden hacer el PKCE flow en el
// servidor. Redirigen aquí con ?return_to=<url>, el dashboard autentica con
// Keycloak y luego devuelve al origen con ?session_token=<jwt>.

function isAllowedReturnUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.hostname.endsWith('.localhost') || parsed.hostname === 'localhost'
  } catch {
    return false
  }
}

function ReturnToHandler() {
  const { isLoading, isAuthenticated, token } = useAuth()

  useEffect(() => {
    if (isLoading || !isAuthenticated || !token) return
    const params = new URLSearchParams(window.location.search)
    const returnTo = params.get('return_to')
    if (!returnTo || !isAllowedReturnUrl(returnTo)) return
    const redirectUrl = new URL(returnTo)
    redirectUrl.searchParams.set('session_token', token)
    window.location.href = redirectUrl.toString()
  }, [isLoading, isAuthenticated, token])

  return null
}

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ui-body dark:bg-ui-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-odoo-purple border-t-transparent animate-spin" />
          <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <TopbarActionsProvider>
        <FavoritesProvider>
          <ReturnToHandler />
          <AppRouter />
        </FavoritesProvider>
      </TopbarActionsProvider>
    </ToastProvider>
  )
}

export default App
