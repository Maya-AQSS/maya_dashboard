import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { NavItem } from '@ceedcv-maya/shared-layout-react'
import { BellIcon, GridIcon, HomeIcon } from '@ceedcv-maya/shared-layout-react'
import { useUserProfile } from '../../features/user-profile'
import { DASHBOARD_PERMISSIONS } from '../../permissions'

function PanelAlertsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
    </svg>
  )
}

export function useNavItems(): NavItem[] {
  const { t } = useTranslation('common')
  const { hasPermission } = useUserProfile()
  const canViewPanelAlerts = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsIndex)

  return useMemo<NavItem[]>(
    () => {
      const items: NavItem[] = [
        { id: 'dashboard', label: t('nav.dashboard'), icon: HomeIcon, path: '/' },
        { id: 'applications', label: t('nav.applications'), icon: GridIcon, path: '/applications' },
        { id: 'notifications', label: t('nav.notifications'), icon: BellIcon, path: '/notifications' },
      ]

      if (canViewPanelAlerts) {
        items.push({
          id: 'panel-alerts',
          label: t('nav.panelAlerts'),
          icon: PanelAlertsIcon,
          path: '/panel-alerts',
        })
      }

      return items
    },
    [canViewPanelAlerts, t],
  )
}
