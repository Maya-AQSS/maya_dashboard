import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

// --- Mocks (hoisted) ---

/** Captura las props que App pasa a MayaAppShell para asserts de cableado. */
const capturedShellProps: Record<string, unknown> = {}

vi.mock('@ceedcv-maya/shared-layout-react', () => ({
  MayaAppShell: ({ children, ...props }: { children: ReactNode } & Record<string, unknown>) => {
    Object.assign(capturedShellProps, props)
    return (
      <div data-testid="maya-app-shell">
        <span>{props.brandName as string}</span>
        {children}
      </div>
    )
  },
}))

const mockNavigate = vi.fn()
const mockLocation = { pathname: '/', search: '', hash: '', state: null, key: 'test' }

vi.mock('react-router-dom', () => ({
  Route: () => null,
  // Routes inerte: evita montar las páginas lazy (fuera del alcance de este test).
  Routes: () => <div data-testid="routes" />,
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@ceedcv-maya/shared-auth-react', () => ({
  // ReturnToHandler (beforeLayout) consume useAuth.
  useAuth: vi.fn(() => ({ isLoading: false, isAuthenticated: true, token: 'tok' })),
  // src/lib/peerService re-exporta estos helpers del paquete compartido.
  peerOrigin: (slug: string) => `https://${slug}.maya.test`,
  resolveServiceUrl: (env: string | undefined, slug: string) =>
    env?.trim() ? env : `https://${slug}.maya.test`,
}))

vi.mock('@ceedcv-maya/shared-hooks-react', () => ({
  buildBackState: vi.fn(() => ({ backTo: { pathname: '/' } })),
}))

vi.mock('@ceedcv-maya/shared-ui-react', () => ({
  SkeletonPage: () => <div data-testid="skeleton-page" />,
}))

const mockNavItems = [{ id: 'dashboard', label: 'Dashboard', path: '/' }]

vi.mock('./components/layout', () => ({
  useNavItems: () => mockNavItems,
}))

const mockHasPermission = vi.fn(() => true)

vi.mock('./features/user-profile', () => ({
  useUserProfile: () => ({ hasPermission: mockHasPermission }),
}))

// --- Imports after mocks ---
import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { buildBackState } from '@ceedcv-maya/shared-hooks-react'
import App from './App'

const mockUseAuth = vi.mocked(useAuth)

/** Replica la resolución de URLs de App.tsx (dependen del env del slot). */
const expectUrl = (env: string | undefined, slug: string) =>
  env?.trim() ? env : `https://${slug}.maya.test`

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHasPermission.mockReturnValue(true)
    for (const key of Object.keys(capturedShellProps)) {
      delete capturedShellProps[key]
    }
  })

  it('renderiza MayaAppShell con la marca PortalCEED', () => {
    render(<App />)

    expect(screen.getByTestId('maya-app-shell')).toBeTruthy()
    expect(screen.getByText('PortalCEED')).toBeTruthy()
    expect(capturedShellProps.brandVersion).toBe('v1.0')
    expect(capturedShellProps.brandLogoUrl).toBe('/favicon.png')
  })

  it('configura el gate como portal: isDashboard + dashboard.login', () => {
    render(<App />)

    expect(capturedShellProps.isDashboard).toBe(true)
    expect(capturedShellProps.loginPermission).toBe('dashboard.login')
  })

  it('resuelve dashboardUrl y dashboardApiUrl con resolveServiceUrl', () => {
    render(<App />)

    expect(capturedShellProps.dashboardUrl).toBe(
      expectUrl(import.meta.env.VITE_DASHBOARD_URL as string | undefined, 'dashboard'),
    )
    expect(capturedShellProps.dashboardApiUrl).toBe(
      expectUrl(import.meta.env.VITE_DASHBOARD_API_URL as string | undefined, 'dashboard-api'),
    )
  })

  it('pasa los nav items de useNavItems', () => {
    render(<App />)

    expect(capturedShellProps.navItems).toBe(mockNavItems)
  })

  it('pasa los mensajes de carga traducidos al shell', () => {
    render(<App />)

    expect(capturedShellProps.loadingInitializingMessage).toBe('auth.initializing')
    expect(capturedShellProps.loadingRedirectingMessage).toBe('auth.redirecting')
    expect(capturedShellProps.loadingProfileMessage).toBe('auth.initializing')
    expect(capturedShellProps.loadingNoPermissionMessage).toBe('signingOutNoPermission')
    expect(capturedShellProps.favoritesLabel).toBe('nav.favorites')
  })

  describe('showProfileLink según permiso profile.show', () => {
    it('true cuando el usuario tiene el permiso', () => {
      mockHasPermission.mockReturnValue(true)
      render(<App />)

      expect(mockHasPermission).toHaveBeenCalledWith('profile.show')
      expect(capturedShellProps.showProfileLink).toBe(true)
    })

    it('false cuando el usuario no tiene el permiso', () => {
      mockHasPermission.mockReturnValue(false)
      render(<App />)

      expect(capturedShellProps.showProfileLink).toBe(false)
    })
  })

  it('onNotificationNavigate navega a la notificación con estado de retorno', () => {
    render(<App />)

    const onNavigate = capturedShellProps.onNotificationNavigate as (n: { id: string }) => void
    onNavigate({ id: '42' })

    expect(buildBackState).toHaveBeenCalledWith(mockLocation)
    expect(mockNavigate).toHaveBeenCalledWith('/notifications/42', {
      state: { backTo: { pathname: '/' } },
    })
  })

  describe('ReturnToHandler (beforeLayout, SSO relay)', () => {
    it('se pasa como beforeLayout y no redirige sin param return_to', () => {
      render(<App />)
      const originalHref = window.location.href

      expect(capturedShellProps.beforeLayout).toBeTruthy()
      render(<>{capturedShellProps.beforeLayout as ReactNode}</>)

      expect(window.location.href).toBe(originalHref)
    })

    it('no redirige mientras la sesión está cargando', () => {
      mockUseAuth.mockReturnValue({
        isLoading: true,
        isAuthenticated: false,
        token: null,
      } as ReturnType<typeof useAuth>)
      render(<App />)
      const originalHref = window.location.href

      render(<>{capturedShellProps.beforeLayout as ReactNode}</>)

      expect(window.location.href).toBe(originalHref)
    })
  })

  it('renderiza las rutas como children del shell', () => {
    render(<App />)

    expect(screen.getByTestId('routes')).toBeTruthy()
  })
})
