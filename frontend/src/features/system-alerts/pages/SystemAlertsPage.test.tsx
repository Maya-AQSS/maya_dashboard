import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('@maya/shared-ui-react', () => ({
  PageTitle: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  ),
  Checkbox: ({
    checked,
    onChange,
    label,
  }: {
    checked: boolean
    onChange: (v: boolean) => void
    label: string
  }) => (
    <label>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  ),
  Select: ({
    children,
    value,
    onChange,
  }: {
    children: React.ReactNode
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    fieldSize?: string
  }) => (
    <select value={value} onChange={onChange}>
      {children}
    </select>
  ),
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

vi.mock('../hooks/useSystemAlerts', () => ({
  useSystemAlerts: vi.fn(),
}))

import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import { useSystemAlerts } from '../hooks/useSystemAlerts'
import SystemAlertsPage from './SystemAlertsPage'

const mockUseAuth = vi.mocked(useAuth)
const mockUseLocale = vi.mocked(useLocale)
const mockUseSystemAlerts = vi.mocked(useSystemAlerts)

const NOOP_ASYNC = vi.fn().mockResolvedValue(undefined)

function setupMocks({
  token = 'tok-abc',
  alerts = [],
  loading = false,
  error = null,
}: {
  token?: string | null
  alerts?: unknown[]
  loading?: boolean
  error?: string | null
} = {}) {
  mockUseAuth.mockReturnValue({ token, user: token ? { sub: 'u1' } : null } as any)
  mockUseLocale.mockReturnValue({
    t: (key: string) => key,
    locale: 'es',
    setLocale: vi.fn(),
    localeOptions: [],
  } as any)
  mockUseSystemAlerts.mockReturnValue({
    alerts: alerts as any,
    loading,
    error,
    onAcknowledge: NOOP_ASYNC,
    onResolve: NOOP_ASYNC,
    refresh: vi.fn(),
  })
}

describe('SystemAlertsPage', () => {
  beforeEach(() => {
    setupMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─── Renderizado básico ───────────────────────────────────────────
  describe('renderizado', () => {
    it('muestra el PageTitle', () => {
      render(<SystemAlertsPage />)
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })

    it('muestra el filtro de severity', () => {
      render(<SystemAlertsPage />)
      expect(screen.getByRole('combobox')).toBeTruthy()
    })

    it('muestra el checkbox activeOnly', () => {
      render(<SystemAlertsPage />)
      expect(screen.getByRole('checkbox')).toBeTruthy()
    })
  })

  // ─── Estado de carga ──────────────────────────────────────────────
  describe('estado de carga', () => {
    it('muestra el mensaje de loading cuando loading es true', () => {
      setupMocks({ loading: true })
      render(<SystemAlertsPage />)
      expect(screen.getByText('dashboard.systemAlerts.loading')).toBeTruthy()
    })

    it('no muestra mensaje de loading cuando loading es false', () => {
      setupMocks({ loading: false })
      render(<SystemAlertsPage />)
      expect(screen.queryByText('dashboard.systemAlerts.loading')).toBeNull()
    })
  })

  // ─── Estado de error ──────────────────────────────────────────────
  describe('estado de error', () => {
    it('muestra el error en un role=alert cuando error no es null', () => {
      setupMocks({ error: 'alerts.errorServer' })
      render(<SystemAlertsPage />)
      const alertEl = screen.getByRole('alert')
      expect(alertEl.textContent).toContain('alerts.errorServer')
    })

    it('no muestra role=alert cuando error es null', () => {
      setupMocks({ error: null })
      render(<SystemAlertsPage />)
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  // ─── Lista vacía ──────────────────────────────────────────────────
  describe('lista vacía', () => {
    it('muestra mensaje de empty active cuando alerts es vacío y activeOnly es true', () => {
      setupMocks({ alerts: [] })
      render(<SystemAlertsPage />)
      // Checkbox starts checked (activeOnly = true)
      expect(screen.getByText('dashboard.systemAlerts.emptyActive')).toBeTruthy()
    })

    it('muestra mensaje de empty genérico cuando activeOnly es false', () => {
      setupMocks({ alerts: [] })
      render(<SystemAlertsPage />)

      // Uncheck activeOnly
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)

      expect(screen.getByText('dashboard.systemAlerts.empty')).toBeTruthy()
    })

    it('no muestra mensaje de empty cuando hay alertas', () => {
      setupMocks({
        alerts: [
          {
            id: 1,
            title: 'CPU alta',
            severity: 'critical',
            source: 'monitor',
            created_at: '2026-05-17T10:00:00Z',
            rule_slug: null,
            acknowledged_at: null,
            resolved_at: null,
            context: null,
          },
        ],
      })
      render(<SystemAlertsPage />)
      expect(screen.queryByText('dashboard.systemAlerts.emptyActive')).toBeNull()
      expect(screen.queryByText('dashboard.systemAlerts.empty')).toBeNull()
    })
  })

  // ─── Filtros ──────────────────────────────────────────────────────
  describe('filtros', () => {
    it('pasa activeOnly=true por defecto al hook', () => {
      render(<SystemAlertsPage />)
      expect(mockUseSystemAlerts).toHaveBeenCalledWith(
        expect.objectContaining({ activeOnly: true }),
      )
    })

    it('pasa severity undefined cuando el select es vacío', () => {
      render(<SystemAlertsPage />)
      expect(mockUseSystemAlerts).toHaveBeenCalledWith(
        expect.objectContaining({ severity: undefined }),
      )
    })

    it('pasa el token del auth al hook', () => {
      setupMocks({ token: 'tok-xyz' })
      render(<SystemAlertsPage />)
      expect(mockUseSystemAlerts).toHaveBeenCalledWith(
        expect.objectContaining({ token: 'tok-xyz' }),
      )
    })

    it('pasa token undefined cuando useAuth retorna null', () => {
      setupMocks({ token: null })
      render(<SystemAlertsPage />)
      expect(mockUseSystemAlerts).toHaveBeenCalledWith(
        expect.objectContaining({ token: undefined }),
      )
    })

    it('actualiza severity al cambiar el select', async () => {
      render(<SystemAlertsPage />)

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'critical' } })

      await waitFor(() => {
        expect(mockUseSystemAlerts).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'critical' }),
        )
      })
    })
  })

  // ─── Renderizado de alertas ───────────────────────────────────────
  describe('renderizado de alertas', () => {
    it('renderiza un AlertRow por cada alerta', () => {
      setupMocks({
        alerts: [
          {
            id: 1,
            title: 'Alerta 1',
            severity: 'critical',
            source: 'src1',
            created_at: '2026-05-17T10:00:00Z',
            rule_slug: null,
            acknowledged_at: null,
            resolved_at: null,
            context: null,
          },
          {
            id: 2,
            title: 'Alerta 2',
            severity: 'high',
            source: 'src2',
            created_at: '2026-05-17T11:00:00Z',
            rule_slug: 'rule-2',
            acknowledged_at: null,
            resolved_at: null,
            context: null,
          },
        ],
      })

      render(<SystemAlertsPage />)

      expect(screen.getByText('Alerta 1')).toBeTruthy()
      expect(screen.getByText('Alerta 2')).toBeTruthy()
    })
  })
})
