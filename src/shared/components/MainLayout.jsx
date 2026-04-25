import { useMemo } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@maya/shared-auth-react'
import { AppLayout, HomeIcon, GridIcon } from '@maya/shared-layout-react'
import { NotificationsBell, SidebarFavorites } from '@maya/shared-sidebar-react'
import { useTopbarActions } from '../context/TopbarActionsContext'
import { useLocale } from '../i18n'

const DASHBOARD_API_URL = import.meta.env.VITE_API_URL

function LocaleSelector() {
  const { locale, setLocale, localeOptions } = useLocale()
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className="text-xs border border-ui-border dark:border-ui-dark-border bg-transparent text-text-secondary dark:text-text-dark-secondary rounded px-1.5 py-0.5 outline-none focus:border-odoo-purple cursor-pointer"
    >
      {localeOptions.map((opt) => (
        <option key={opt.code} value={opt.code}>{opt.label}</option>
      ))}
    </select>
  )
}

function AnimatedOutlet() {
  const location = useLocation()
  return (
    <div key={location.key} className="animate-fade-in h-full">
      <Outlet />
    </div>
  )
}

function MainLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { actions: topbarActions } = useTopbarActions()
  const { t } = useLocale()

  const navItems = useMemo(() => [
    { id: 'dashboard', label: t('layout.navDashboard'), icon: HomeIcon, path: '/' },
    { id: 'applications', label: t('applications.title'), icon: GridIcon, path: '/applications' },
  ], [t])

  const displayName = user?.name ?? user?.preferred_username ?? ''
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const combinedActions = (
    <div className="flex items-center gap-2">
      {topbarActions}
      <NotificationsBell dashboardApiUrl={DASHBOARD_API_URL} />
      <LocaleSelector />
    </div>
  )

  return (
    <AppLayout
      navItems={navItems}
      brandName="Maya Dashboard"
      brandVersion="Maya Dashboard v1.0"
      userName={displayName}
      userInitials={initials}
      onLogout={logout}
      onProfile={() => navigate('/profile')}
      sidebarFooter={<SidebarFavorites label={t('favorites.title')} dashboardApiUrl={DASHBOARD_API_URL} />}
      topbarActions={combinedActions}
    >
      <AnimatedOutlet />
    </AppLayout>
  )
}

export default MainLayout
