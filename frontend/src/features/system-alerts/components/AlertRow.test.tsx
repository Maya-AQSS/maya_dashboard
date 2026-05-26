import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@ceedcv-maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@ceedcv-maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('@ceedcv-maya/shared-ui-react', () => ({
  Button: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { AlertRow, type SystemAlert } from './AlertRow'

const mockUseLocale = vi.mocked(useLocale)

function makeAlert(overrides: Partial<SystemAlert> = {}): SystemAlert {
  return {
    id: 1,
    title: 'CPU Alta',
    severity: 'critical',
    source: 'monitor',
    created_at: '2026-05-17T10:00:00Z',
    rule_slug: 'cpu-rule',
    acknowledged_at: null,
    resolved_at: null,
    context: null,
    ...overrides,
  }
}

describe('AlertRow', () => {
  beforeEach(() => {
    mockUseLocale.mockReturnValue({
      t: (key: string) => key,
      locale: 'es',
      setLocale: vi.fn(),
      localeOptions: [],
    } as any)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─── Renderizado básico ────────────────────────────────────────────
  describe('renderizado', () => {
    it('muestra el título del alerta', () => {
      render(
        <AlertRow
          alert={makeAlert({ title: 'Disco Lleno' })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      // getByText throws if not found — sufficient to prove it renders
      expect(screen.getByText('Disco Lleno')).toBeTruthy()
    })

    it('muestra el source del alerta', () => {
      render(
        <AlertRow
          alert={makeAlert({ source: 'disk-monitor' })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(screen.getByText(/disk-monitor/)).toBeTruthy()
    })

    it('muestra el rule_slug cuando está presente', () => {
      render(
        <AlertRow
          alert={makeAlert({ rule_slug: 'my-rule' })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(screen.getByText(/my-rule/)).toBeTruthy()
    })

    it('muestra la i18n key adHoc cuando rule_slug es null', () => {
      render(
        <AlertRow
          alert={makeAlert({ rule_slug: null })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(screen.getByText(/dashboard\.systemAlerts\.adHoc/)).toBeTruthy()
    })

    it('renderiza context como JSON cuando está presente', () => {
      render(
        <AlertRow
          alert={makeAlert({ context: { host: 'server1', cpu: 99 } })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      const pre = document.querySelector('pre')
      expect(pre).not.toBeNull()
      expect(pre?.textContent).toContain('"host": "server1"')
    })

    it('no renderiza pre cuando context es null', () => {
      render(
        <AlertRow
          alert={makeAlert({ context: null })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(document.querySelector('pre')).toBeNull()
    })

    it('no renderiza pre cuando context es objeto vacío', () => {
      render(
        <AlertRow
          alert={makeAlert({ context: {} })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(document.querySelector('pre')).toBeNull()
    })
  })

  // ─── Botones según estado del alerta ──────────────────────────────
  describe('visibilidad de botones', () => {
    it('muestra botón acknowledge cuando acknowledged_at es null', () => {
      render(
        <AlertRow
          alert={makeAlert({ acknowledged_at: null })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(screen.getByText('dashboard.systemAlerts.acknowledge')).toBeTruthy()
    })

    it('oculta botón acknowledge cuando acknowledged_at está definido', () => {
      render(
        <AlertRow
          alert={makeAlert({ acknowledged_at: '2026-05-17T10:00:00Z' })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(screen.queryByText('dashboard.systemAlerts.acknowledge')).toBeNull()
    })

    it('muestra botón resolve cuando resolved_at es null', () => {
      render(
        <AlertRow
          alert={makeAlert({ resolved_at: null })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(screen.getByText('dashboard.systemAlerts.resolve')).toBeTruthy()
    })

    it('oculta botón resolve cuando resolved_at está definido', () => {
      render(
        <AlertRow
          alert={makeAlert({ resolved_at: '2026-05-17T10:00:00Z' })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(screen.queryByText('dashboard.systemAlerts.resolve')).toBeNull()
    })
  })

  // ─── Acciones ─────────────────────────────────────────────────────
  describe('acción acknowledge', () => {
    it('llama onAcknowledge con el id del alerta al hacer click', async () => {
      const onAcknowledge = vi.fn().mockResolvedValue(undefined)

      render(
        <AlertRow
          alert={makeAlert({ id: 42 })}
          onAcknowledge={onAcknowledge}
          onResolve={vi.fn()}
        />,
      )

      fireEvent.click(screen.getByText('dashboard.systemAlerts.acknowledge'))

      await waitFor(() => expect(onAcknowledge).toHaveBeenCalledWith(42))
    })

    it('muestra error inline cuando onAcknowledge lanza', async () => {
      const onAcknowledge = vi.fn().mockRejectedValue(new Error('alerts.errorAck'))

      render(
        <AlertRow
          alert={makeAlert()}
          onAcknowledge={onAcknowledge}
          onResolve={vi.fn()}
        />,
      )

      fireEvent.click(screen.getByText('dashboard.systemAlerts.acknowledge'))

      await waitFor(() => {
        expect(screen.getByRole('alert').textContent).toContain('alerts.errorAck')
      })
    })

    it('muestra fallback de error cuando onAcknowledge lanza sin Error instance', async () => {
      const onAcknowledge = vi.fn().mockRejectedValue('boom')

      render(
        <AlertRow
          alert={makeAlert()}
          onAcknowledge={onAcknowledge}
          onResolve={vi.fn()}
        />,
      )

      fireEvent.click(screen.getByText('dashboard.systemAlerts.acknowledge'))

      await waitFor(() => {
        expect(screen.getByRole('alert').textContent).toContain('alerts.errorAck')
      })
    })
  })

  describe('acción resolve', () => {
    it('llama onResolve con el id del alerta al hacer click', async () => {
      const onResolve = vi.fn().mockResolvedValue(undefined)

      render(
        <AlertRow
          alert={makeAlert({ id: 7 })}
          onAcknowledge={vi.fn()}
          onResolve={onResolve}
        />,
      )

      fireEvent.click(screen.getByText('dashboard.systemAlerts.resolve'))

      await waitFor(() => expect(onResolve).toHaveBeenCalledWith(7))
    })

    it('muestra error inline cuando onResolve lanza', async () => {
      const onResolve = vi.fn().mockRejectedValue(new Error('alerts.errorResolve'))

      render(
        <AlertRow
          alert={makeAlert()}
          onAcknowledge={vi.fn()}
          onResolve={onResolve}
        />,
      )

      fireEvent.click(screen.getByText('dashboard.systemAlerts.resolve'))

      await waitFor(() => {
        expect(screen.getByRole('alert').textContent).toContain('alerts.errorResolve')
      })
    })
  })

  // ─── Severity CSS ─────────────────────────────────────────────────
  describe('severity class', () => {
    it('aplica border-l-danger para severity critical', () => {
      render(
        <AlertRow
          alert={makeAlert({ severity: 'critical' })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      const li = screen.getByRole('listitem')
      expect(li.className).toContain('border-l-danger')
    })

    it('aplica border-l-warning-dark para severity high', () => {
      render(
        <AlertRow
          alert={makeAlert({ severity: 'high' })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(screen.getByRole('listitem').className).toContain('border-l-warning-dark')
    })

    it('aplica fallback border-l-ui-border para severity desconocida', () => {
      render(
        <AlertRow
          alert={makeAlert({ severity: 'unknown-level' })}
          onAcknowledge={vi.fn()}
          onResolve={vi.fn()}
        />,
      )

      expect(screen.getByRole('listitem').className).toContain('border-l-ui-border')
    })
  })
})
