import { useMemo } from'react'
import { useTranslation } from'react-i18next'
import type { NavItem } from'@maya/shared-layout-react'
import { HomeIcon, GridIcon } from'@maya/shared-layout-react'

export function useNavItems(): NavItem[] {
 const { t } = useTranslation('common')
 return useMemo<NavItem[]>(() => [
 { id:'dashboard', label: t('layout.navDashboard'), icon: HomeIcon, path:'/' },
 { id:'applications', label: t('applications.title'), icon: GridIcon, path:'/applications' },
 ],
 [t],
 )
}
