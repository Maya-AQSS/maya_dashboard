import { useAuth } from '@maya/shared-auth-react'
import { AppLayout, HomeIcon, GridIcon, UserIcon } from '@maya/shared-layout-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/' },
  { id: 'tools', label: 'Herramientas', icon: GridIcon, path: '/tools' },
  { id: 'profile', label: 'Perfil', icon: UserIcon, path: '/profile' },
]

function MainLayout() {
  const { user, logout } = useAuth()

  const displayName = user?.name ?? user?.preferred_username ?? ''
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <AppLayout
      navItems={NAV_ITEMS}
      brandName="Maya Dashboard"
      brandVersion="Maya Dashboard v1.0"
      userName={displayName}
      userInitials={initials}
      onLogout={logout}
    />
  )
}

export default MainLayout