import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}))

import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import NotFoundPage from './NotFoundPage'

const mockUseAuth = vi.mocked(useAuth)
const mockUseLocale = vi.mocked(useLocale)

function setupMocks(user: null | object = null) {
  mockUseAuth.mockReturnValue({ user, token: user ? 'tok' : null } as any)
  mockUseLocale.mockReturnValue({
    t: (key: string) => key,
    locale: 'es',
    setLocale: vi.fn(),
    localeOptions: [],
  } as any)
}

describe('NotFoundPage', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('usuario autenticado', () => {
    beforeEach(() => {
      setupMocks({ sub: 'u1', name: 'Juan' })
    })

    it('muestra el código 404', () => {
      render(<NotFoundPage />)
      expect(screen.getByText('404')).toBeTruthy()
    })

    it('muestra el título de not found', () => {
      render(<NotFoundPage />)
      expect(screen.getByText('layout.notFoundTitle')).toBeTruthy()
    })

    it('muestra el link hacia /applications', () => {
      render(<NotFoundPage />)
      const link = screen.getByRole('link')
      expect((link as HTMLAnchorElement).href).toContain('/applications')
    })

    it('usa la label de volver al dashboard', () => {
      render(<NotFoundPage />)
      expect(screen.getByText('layout.notFoundBackDashboard')).toBeTruthy()
    })
  })

  describe('usuario no autenticado', () => {
    beforeEach(() => {
      setupMocks(null)
    })

    it('muestra el código 404', () => {
      render(<NotFoundPage />)
      expect(screen.getByText('404')).toBeTruthy()
    })

    it('muestra el link hacia /login', () => {
      render(<NotFoundPage />)
      const link = screen.getByRole('link')
      expect((link as HTMLAnchorElement).href).toContain('/login')
    })

    it('usa la label de ir al login', () => {
      render(<NotFoundPage />)
      expect(screen.getByText('layout.notFoundGoLogin')).toBeTruthy()
    })
  })
})
