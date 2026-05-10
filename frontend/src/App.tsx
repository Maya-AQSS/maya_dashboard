import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppLayout } from '@maya/shared-layout-react'
import { NotificationsBell, SidebarFavorites } from '@maya/shared-sidebar-react'
import { useAuth, useOidcSession } from '@maya/shared-auth-react'
import { Button, ErrorBoundary, SkeletonPage, ToastProvider } from '@maya/shared-ui-react'
import { useNavItems } from './components/layout'
import { FavoritesProvider } from './features/favorites/context/FavoritesContext'

function ErrorFallback() {
  const { t } = useTranslation('common')
  const handleReload = () => {
    const url = new URL(window.location.href)
    url.searchParams.delete('crash')
    window.location.assign(url.toString())
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-ui-body dark:bg-ui-dark-bg px-6">
      <div className="w-full max-w-[560px] rounded-2xl border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card px-8 py-10 text-center shadow-[0_18px_25px_-10px_rgba(17,24,39,0.2),0_4px_8px_-2px_rgba(17,24,39,0.08)] dark:shadow-none">
        <p className="text-4xl font-semibold text-odoo-purple m-0">Error</p>
        <h1 className="mt-4 mb-2 text-2xl font-semibold text-text-primary dark:text-text-dark-primary">
          {t('layout.errorBoundaryTitle')}
        </h1>
        <p className="m-0 text-sm sm:text-base text-text-secondary dark:text-text-dark-secondary">
          {t('layout.errorBoundaryDescription')}
        </p>
        <div className="mt-6">
          <Button variant="primary" size="md" onClick={handleReload}>
            {t('layout.errorBoundaryReload')}
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Pequeñas sincronizaciones que antes vivían en LocaleProvider:
 *  1. Si Keycloak trae `user.locale`, alinearlo con i18next al montar.
 *  2. Mantener `<html lang>` actualizado al cambio de idioma.
 * El resto (cookies, cross-tab) ya lo gestiona `createI18n` shared.
 */
function LocaleSyncEffects() {
  const { i18n } = useTranslation()
  const { user } = useAuth()
  useEffect(() => {
    const kc = (user?.locale as string | undefined) ?? null
    if (kc && kc !== i18n.resolvedLanguage) {
      void i18n.changeLanguage(kc)
    }
  }, [user?.locale, i18n])
  useEffect(() => {
    const lang = i18n.resolvedLanguage ?? i18n.language ?? 'es'
    document.documentElement.lang = lang === 'va' ? 'ca' : lang
  }, [i18n.resolvedLanguage, i18n.language])
  return null
}

const DASHBOARD_API_URL = (import.meta.env.VITE_DASHBOARD_API_URL as string | undefined)
  ?? 'http://maya_dashboard_api.localhost'

// SSO return_to handler: server-rendered apps redirect here with ?return_to=<url>,
// the dashboard authenticates with Keycloak and redirects back with ?session_token=<jwt>.
function isAllowedReturnUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const isAllowedScheme = parsed.protocol === 'http:' || parsed.protocol === 'https:'
    const isAllowedHost = parsed.hostname.endsWith('.localhost') || parsed.hostname === 'localhost'
    return isAllowedScheme && isAllowedHost
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
    redirectUrl.hash = `session_token=${encodeURIComponent(token)}`
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
    <Suspense fallback={<SkeletonPage />}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
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
        brandLogoUrl="/favicon.png"
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

// Locale sync (Keycloak + html lang) ahora lo cubre <LocaleSyncEffects/>; el resto
// del setup i18n vive en `src/i18n/index.ts` y `@maya/shared-i18n-react`.
// ToastProvider envuelve AppWithLayout para que `useToast` esté disponible.
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <FavoritesProvider>
          <LocaleSyncEffects />
          {children}
        </FavoritesProvider>
      </ErrorBoundary>
    </ToastProvider>
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
