import { useMemo } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@maya/shared-auth-react'
import { AppLayout, HomeIcon, GridIcon } from '@maya/shared-layout-react'
import { useFavoritesContext } from '../../features/favorites/context/FavoritesContext'
import { useTopbarActions } from '../context/TopbarActionsContext'
import { useLocale } from '../i18n'

function SidebarFavorites({ favorites }) {
  if (!favorites.length) return null

  return (
    <div className="px-1">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2 mb-1">Favoritas</p>
      {favorites.map((fav) => (
        <a
          key={fav.id}
          href={fav.traefik_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          title={fav.name}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-white/60 hover:text-white/90 hover:bg-ui-sidebar-hover dark:hover:bg-ui-dark-card transition-colors whitespace-nowrap overflow-hidden"
        >
          <span className="text-amber-400 text-xs shrink-0">★</span>
          <span className="truncate">{fav.name}</span>
        </a>
      ))}
    </div>
  )
}

function LocaleSelector() {
  const { locale, setLocale, localeOptions } = useLocale()
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className="text-xs border border-gray-300 dark:border-white/20 bg-transparent text-gray-600 dark:text-white/70 rounded px-1.5 py-0.5 outline-none focus:border-odoo-primary cursor-pointer"
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
  const { favorites } = useFavoritesContext()
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
      sidebarFooter={<SidebarFavorites favorites={favorites} />}
      topbarActions={combinedActions}
    >
      <AnimatedOutlet />
    </AppLayout>
  )
}

export default MainLayout
