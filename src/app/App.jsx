import { useEffect } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import AppRouter from './router'
import { FavoritesProvider } from '../features/favorites/context/FavoritesContext'
import { TopbarActionsProvider } from '../shared/context/TopbarActionsContext'

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
      <div className="flex items-center justify-center min-h-screen">
        Cargando autenticación...
      </div>
    )
  }

  return (
    <TopbarActionsProvider>
      <FavoritesProvider>
        <ReturnToHandler />
        <AppRouter />
      </FavoritesProvider>
    </TopbarActionsProvider>
  )
}

export default App
