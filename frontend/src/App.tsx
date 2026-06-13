import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MayaAppShell } from '@ceedcv-maya/shared-layout-react'
import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { buildBackState } from '@ceedcv-maya/shared-hooks-react'
import { SkeletonPage } from '@ceedcv-maya/shared-ui-react'
import { useNavItems } from './components/layout'
import { useUserProfile } from './features/user-profile'
import { resolveServiceUrl } from './lib/peerService'
import { DASHBOARD_PERMISSIONS } from './permissions'

const DASHBOARD_API_URL = resolveServiceUrl(
  import.meta.env.VITE_DASHBOARD_API_URL as string | undefined,
  'dashboard-api',
)

// El dashboard ES el portal: dashboardUrl apunta a su propio origen, de modo
// que el enlace "Mi perfil" del shell resuelve a la ruta local `/profile`.
// La navegación SPA con back-state se cablea vía `onProfileNavigate` (ver App()).
const DASHBOARD_URL = resolveServiceUrl(
  import.meta.env.VITE_DASHBOARD_URL as string | undefined,
  'dashboard',
)

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
const NotificationsPage = lazy(() => import('./features/notifications/pages/NotificationsPage'))
const NotificationDetailPage = lazy(() => import('./features/notifications/pages/NotificationDetailPage'))
const PanelAlertsPage = lazy(() => import('./features/panel-alerts/pages/PanelAlertsPage'))
const PanelAlertFormPage = lazy(() => import('./features/panel-alerts/pages/PanelAlertFormPage'))
const NotificationRuleFormPage = lazy(() => import('./features/panel-alerts/pages/NotificationRuleFormPage'))
const NotFoundPage = lazy(() => import('./shared/pages/NotFoundPage'))

function AppRoutes() {
  return (
    <Suspense fallback={<SkeletonPage />}>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/notifications/:id" element={<NotificationDetailPage />} />
        <Route path="/panel-alerts" element={<PanelAlertsPage />} />
        <Route path="/panel-alerts/alertas/nueva" element={<PanelAlertFormPage />} />
        <Route path="/panel-alerts/alertas/:id" element={<PanelAlertFormPage />} />
        <Route path="/panel-alerts/reglas/nueva" element={<NotificationRuleFormPage />} />
        <Route path="/panel-alerts/reglas/:id" element={<NotificationRuleFormPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

/**
 * App shell unificado (@ceedcv-maya/shared-layout-react).
 *
 * El shell gestiona: init OIDC + redirect a login, gate de permiso
 * (`dashboard.login` vía useLogoutWithoutLoginPermission — isDashboard:
 * el portal no puede redirigirse a sí mismo), AppLayout con
 * NotificationsBell/SidebarFavorites/resolveUserDisplay,
 * useKeycloakLocaleSync y useRealtimeNotifications.
 *
 * Divergencias del dashboard expresadas con props del shell:
 * - `isDashboard`: gate con logout en vez de redirect al portal.
 * - `showProfileLink`: condicionado al permiso `profile.show`.
 * - `onNotificationNavigate`: navegación SPA con estado de retorno.
 * - `onProfileNavigate`: navegación SPA a `/profile` con back-state (en vez de
 *   la recarga completa por defecto del shell).
 * - `beforeLayout`: ReturnToHandler (SSO relay `?return_to`).
 */
export default function App() {
  const { t } = useTranslation('auth')
  const { t: tCommon } = useTranslation('common')
  const navItems = useNavItems()
  const { hasPermission } = useUserProfile()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <MayaAppShell
      brandName="PortalCEED"
      brandVersion="v1.0"
      brandLogoUrl="/favicon.png"
      dashboardUrl={DASHBOARD_URL}
      dashboardApiUrl={DASHBOARD_API_URL}
      navItems={navItems}
      loginPermission={DASHBOARD_PERMISSIONS.login}
      isDashboard
      showProfileLink={hasPermission(DASHBOARD_PERMISSIONS.profileShow)}
      onProfileNavigate={() =>
        navigate('/profile', { state: buildBackState(location) })
      }
      onNotificationNavigate={(notification) =>
        navigate(`/notifications/${notification.id}`, { state: buildBackState(location) })
      }
      loadingInitializingMessage={t('auth.initializing')}
      loadingRedirectingMessage={t('auth.redirecting')}
      loadingProfileMessage={t('auth.initializing')}
      loadingNoPermissionMessage={t('signingOutNoPermission')}
      favoritesLabel={tCommon('nav.favorites')}
      beforeLayout={<ReturnToHandler />}
    >
      <AppRoutes />
    </MayaAppShell>
  )
}
