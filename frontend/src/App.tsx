import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@maya/shared-layout-react'
import { NotificationsBell, SidebarFavorites } from '@maya/shared-sidebar-react'
import { useAuth, useOidcSession } from '@maya/shared-auth-react'
import { useNavItems } from './components/layout'
import { LocaleProvider } from './shared/i18n'
import { ToastProvider } from './shared/context/ToastContext'
import { FavoritesProvider } from './features/favorites/context/FavoritesContext'
import GlobalErrorBoundary from './shared/components/GlobalErrorBoundary'
import PageSkeleton from './shared/components/PageSkeleton'

const DASHBOARD_API_URL = (import.meta.env.VITE_DASHBOARD_API_URL as string | undefined)
  ?? 'http://maya_dashboard_api.localhost'

// SSO return_to handler: server-rendered apps redirect here with ?return_to=<url>,
// the dashboard authenticates with Keycloak and redirects back with ?session_token=<jwt>.
function isAllowedReturnUrl(url: string): boolean {
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

const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'))
const ApplicationsListPage = lazy(() => import('./features/applications/pages/ApplicationsListPage'))
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage'))
const SystemAlertsPage = lazy(() => import('./features/system-alerts/pages/SystemAlertsPage'))
const NotFoundPage = lazy(() => import('./shared/pages/NotFoundPage'))

function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/tools" element={<Navigate to="/applications" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/alerts" element={<SystemAlertsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

function AppWithLayout() {
  const { logout, user } = useOidcSession()
  const navItems = useNavItems()
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  const displayName = ((user?.name ?? user?.preferred_username ?? '') as string).trim()
  const userEmail = (user?.email as string | undefined) ?? undefined
  const userInitials = displayName
    ? displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <>
      <ReturnToHandler />
      <AppLayout
        navItems={navItems}
        brandName="Maya Dashboard"
        brandVersion="v1.0"
        userName={displayName}
        userEmail={userEmail}
        userInitials={userInitials}
        onLogout={logout}
        onProfile={() => navigate('/profile')}
        favoritesSlot={
          <SidebarFavorites label={t('favorites.title')} dashboardApiUrl={DASHBOARD_API_URL} />
        }
        notificationsSlot={<NotificationsBell dashboardApiUrl={DASHBOARD_API_URL} />}
      >
        <AppRoutes />
      </AppLayout>
    </>
  )
}

// LocaleProvider handles locale sync (Keycloak + storage events + html lang attribute).
// ToastProvider and TopbarActionsProvider must wrap AppWithLayout so their hooks are available.
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ToastProvider>
        <GlobalErrorBoundary>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </GlobalErrorBoundary>
      </ToastProvider>
    </LocaleProvider>
  )
}

export default function App() {
  const { isOidcLoading, isOidcSignedIn, beginSignIn } = useOidcSession()

  useEffect(() => {
    if (!isOidcLoading && !isOidcSignedIn) {
      beginSignIn()
    }
  }, [isOidcLoading, isOidcSignedIn, beginSignIn])

  if (isOidcLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-ui-body dark:bg-ui-dark-bg text-text-muted dark:text-text-dark-muted font-sans">
        Iniciando sesión…
      </div>
    )
  }

  if (!isOidcSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-ui-body dark:bg-ui-dark-bg text-text-muted dark:text-text-dark-muted font-sans">
        Redirigiendo al inicio de sesión...
      </div>
    )
  }

  return (
    <AppProviders>
      <AppWithLayout />
    </AppProviders>
  )
}
