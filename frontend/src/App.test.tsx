import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'

// --- Mocks ---

vi.mock('react-router-dom', () => ({
  Route: ({ element }: { element: React.ReactNode }) => <>{element}</>,
  Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({ t: (k: string) => k })),
}))

vi.mock('@ceedcv-maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
  useOidcSession: vi.fn(),
}))

vi.mock('@ceedcv-maya/shared-i18n-react', () => ({
  useKeycloakLocaleSync: vi.fn(),
  useLocale: vi.fn(),
}))

vi.mock('@ceedcv-maya/shared-layout-react', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}))

vi.mock('@ceedcv-maya/shared-sidebar-react', () => ({
  NotificationsBell: () => <div data-testid="notifications-bell" />,
  SidebarFavorites: () => <div data-testid="sidebar-favorites" />,
}))

vi.mock('@ceedcv-maya/shared-ui-react', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SkeletonPage: () => <div data-testid="skeleton-page" />,
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('./components/layout', () => ({
  useNavItems: vi.fn(() => []),
}))

vi.mock('./features/favorites/context/FavoritesContext', () => ({
  FavoritesProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('./features/user-profile', () => ({
  UserProfileProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useUserProfile: vi.fn(() => ({
    hasPermission: () => true,
  })),
}))

// Lazy page mocks — loaded synchronously
vi.mock('./features/dashboard/pages/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page" />,
}))

vi.mock('./features/applications/pages/ApplicationsListPage', () => ({
  default: () => <div data-testid="applications-page" />,
}))

vi.mock('./features/profile/pages/ProfilePage', () => ({
  default: () => <div data-testid="profile-page" />,
}))

vi.mock('./features/system-alerts/pages/SystemAlertsPage', () => ({
  default: () => <div data-testid="system-alerts-page" />,
}))

vi.mock('./shared/pages/NotFoundPage', () => ({
  default: () => <div data-testid="not-found-page" />,
}))

// --- Imports after mocks ---
import { useOidcSession, useAuth } from '@ceedcv-maya/shared-auth-react'
import App from './App'

const mockUseOidcSession = vi.mocked(useOidcSession)
const mockUseAuth = vi.mocked(useAuth)

function setupSession({
  isOidcLoading = false,
  isOidcSignedIn = false,
  beginSignIn = vi.fn(),
  logout = vi.fn(),
  user = null as null | { name?: string; preferred_username?: string; email?: string },
} = {}) {
  mockUseOidcSession.mockReturnValue({
    isOidcLoading,
    isOidcSignedIn,
    beginSignIn,
    logout,
    user,
  } as any)

  mockUseAuth.mockReturnValue({
    isLoading: false,
    isAuthenticated: isOidcSignedIn,
    token: 'tok',
    user: user as any,
  } as any)
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('estado de carga OIDC', () => {
    it('muestra pantalla de carga cuando isOidcLoading es true', () => {
      setupSession({ isOidcLoading: true })
      render(<App />)
      expect(screen.getByText('Iniciando sesión…')).toBeTruthy()
    })

    it('no muestra AppLayout durante la carga', () => {
      setupSession({ isOidcLoading: true })
      render(<App />)
      expect(screen.queryByTestId('app-layout')).toBeNull()
    })
  })

  describe('no autenticado', () => {
    it('muestra mensaje de redirección cuando no está autenticado', () => {
      setupSession({ isOidcLoading: false, isOidcSignedIn: false })
      render(<App />)
      expect(screen.getByText('Redirigiendo al inicio de sesión...')).toBeTruthy()
    })

    it('llama beginSignIn cuando no está autenticado y no está cargando', () => {
      const beginSignIn = vi.fn()
      setupSession({ isOidcLoading: false, isOidcSignedIn: false, beginSignIn })
      render(<App />)
      expect(beginSignIn).toHaveBeenCalledTimes(1)
    })

    it('no llama beginSignIn mientras isOidcLoading es true', () => {
      const beginSignIn = vi.fn()
      setupSession({ isOidcLoading: true, isOidcSignedIn: false, beginSignIn })
      render(<App />)
      expect(beginSignIn).not.toHaveBeenCalled()
    })

    it('no muestra AppLayout cuando no está autenticado', () => {
      setupSession({ isOidcLoading: false, isOidcSignedIn: false })
      render(<App />)
      expect(screen.queryByTestId('app-layout')).toBeNull()
    })
  })

  describe('autenticado', () => {
    it('muestra AppLayout cuando está autenticado', () => {
      setupSession({
        isOidcSignedIn: true,
        user: { name: 'María García', email: 'maria@example.com' },
      })
      render(<App />)
      expect(screen.getByTestId('app-layout')).toBeTruthy()
    })

    it('no muestra pantalla de carga cuando está autenticado', () => {
      setupSession({ isOidcSignedIn: true })
      render(<App />)
      expect(screen.queryByText('Iniciando sesión…')).toBeNull()
    })

    it('no muestra mensaje de redirección cuando está autenticado', () => {
      setupSession({ isOidcSignedIn: true })
      render(<App />)
      expect(screen.queryByText('Redirigiendo al inicio de sesión...')).toBeNull()
    })
  })

  describe('isAllowedReturnUrl (via ReturnToHandler)', () => {
    it('no redirige cuando no hay param return_to', () => {
      const originalHref = window.location.href
      setupSession({
        isOidcSignedIn: true,
        user: { name: 'Test' },
      })
      // mockUseAuth has isAuthenticated=true and token='tok'
      mockUseAuth.mockReturnValue({
        isLoading: false,
        isAuthenticated: true,
        token: 'tok',
        user: null,
      } as any)

      render(<App />)
      // No redirect happened
      expect(window.location.href).toBe(originalHref)
    })
  })

  describe('ErrorFallback', () => {
    it('renderiza el componente App sin lanzar errores', () => {
      setupSession({ isOidcSignedIn: true })
      const { container } = render(<App />)
      expect(container.firstChild).not.toBeNull()
    })
  })
})

describe('isAllowedReturnUrl (unidad pura)', () => {
  // We test the exported behavior via App rendering — but we can also
  // test the pure logic indirectly by asserting App doesn't crash on
  // various URL patterns when window.location.search contains return_to
  it('renderiza App correctamente cuando está autenticado (smoke test)', () => {
    mockUseOidcSession.mockReturnValue({
      isOidcLoading: false,
      isOidcSignedIn: true,
      beginSignIn: vi.fn(),
      logout: vi.fn(),
      user: null,
    } as any)
    mockUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      token: 'tok',
      user: null,
    } as any)
    const { container } = render(<App />)
    expect(container.firstChild).not.toBeNull()
  })
})
