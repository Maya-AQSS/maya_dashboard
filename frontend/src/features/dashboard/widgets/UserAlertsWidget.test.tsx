import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('../../alerts/hooks/useUserAlerts', () => ({
  useUserAlerts: vi.fn(),
}))

vi.mock('@ceedcv-maya/shared-ui-react', () => ({
  Button: ({
    children,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    onClick?: () => void
    'aria-label'?: string
  }) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}))

import { useUserAlerts } from '../../alerts/hooks/useUserAlerts'
import UserAlertsWidget from './UserAlertsWidget'

const mockUseUserAlerts = vi.mocked(useUserAlerts)
const dismissMock = vi.fn()
const clockInMock = vi.fn()

type AlertItem = {
  id: string
  text: string
  color: 'amber' | 'blue' | 'red' | 'green'
  actionLabel?: string
  actionKind?: string
  actionUrl?: string
  canDismiss?: boolean
}

function setupMocks({
  alerts = [] as AlertItem[],
  loading = false,
} = {}) {
  mockUseUserAlerts.mockReturnValue({
    alerts,
    loading,
    dismiss: dismissMock,
    clockIn: clockInMock,
  })
}

describe('UserAlertsWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('estado de carga', () => {
    it('renderiza skeletons cuando loading es true', () => {
      setupMocks({ loading: true })
      const { container } = render(<UserAlertsWidget />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(2)
    })

    it('no muestra alertas cuando loading es true', () => {
      setupMocks({
        loading: true,
        alerts: [{ id: '1', text: 'Alerta visible', color: 'blue' }],
      })
      render(<UserAlertsWidget />)
      expect(screen.queryByText('Alerta visible')).toBeNull()
    })
  })

  describe('lista vacía', () => {
    it('muestra "No hay alertas" cuando la lista está vacía', () => {
      setupMocks({ alerts: [] })
      render(<UserAlertsWidget />)
      expect(screen.getByText('No hay alertas')).toBeTruthy()
    })
  })

  describe('lista con alertas', () => {
    it('muestra el texto de cada alerta', () => {
      setupMocks({
        alerts: [
          { id: '1', text: 'Primera alerta', color: 'blue' },
          { id: '2', text: 'Segunda alerta', color: 'amber' },
        ],
      })
      render(<UserAlertsWidget />)
      expect(screen.getByText('Primera alerta')).toBeTruthy()
      expect(screen.getByText('Segunda alerta')).toBeTruthy()
    })

    it('renderiza el HTML del editor en lugar de mostrar etiquetas literales', () => {
      setupMocks({
        alerts: [{ id: '1', text: '<p><strong>Prueba</strong></p>', color: 'amber' }],
      })
      render(<UserAlertsWidget />)
      expect(screen.getByText('Prueba')).toBeTruthy()
      expect(screen.queryByText('<p><strong>Prueba</strong></p>')).toBeNull()
    })

    it('muestra el botón de acción cuando actionLabel está presente', () => {
      setupMocks({
        alerts: [{ id: '1', text: 'Alerta', color: 'blue', actionLabel: 'Ver detalle' }],
      })
      render(<UserAlertsWidget />)
      expect(screen.getByText('Ver detalle')).toBeTruthy()
    })

    it('no muestra botón de acción cuando actionLabel es undefined', () => {
      setupMocks({
        alerts: [{ id: '1', text: 'Alerta sin acción', color: 'blue' }],
      })
      render(<UserAlertsWidget />)
      expect(screen.queryByText('Ver detalle')).toBeNull()
    })

    it('muestra botón de descartar cuando canDismiss no es false', () => {
      setupMocks({
        alerts: [{ id: '1', text: 'Alerta descartable', color: 'blue' }],
      })
      render(<UserAlertsWidget />)
      expect(screen.getByLabelText('Descartar alerta')).toBeTruthy()
    })

    it('no muestra botón de descartar cuando canDismiss es false', () => {
      setupMocks({
        alerts: [{ id: '1', text: 'Alerta permanente', color: 'red', canDismiss: false }],
      })
      render(<UserAlertsWidget />)
      expect(screen.queryByLabelText('Descartar alerta')).toBeNull()
    })
  })

  describe('interacciones', () => {
    it('llama a dismiss con el id al hacer clic en descartar', () => {
      setupMocks({
        alerts: [{ id: 'alert-42', text: 'Descartable', color: 'green' }],
      })
      render(<UserAlertsWidget />)
      fireEvent.click(screen.getByLabelText('Descartar alerta'))
      expect(dismissMock).toHaveBeenCalledWith('alert-42')
    })

    it('llama a clockIn cuando actionKind es "clockIn"', () => {
      setupMocks({
        alerts: [
          {
            id: '1',
            text: 'Fichar entrada',
            color: 'amber',
            actionLabel: 'Fichar',
            actionKind: 'clockIn',
          },
        ],
      })
      render(<UserAlertsWidget />)
      fireEvent.click(screen.getByText('Fichar'))
      expect(clockInMock).toHaveBeenCalledTimes(1)
    })

    it('llama a window.location.assign cuando actionUrl está presente y actionKind no es clockIn', () => {
      const assignMock = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { assign: assignMock },
        writable: true,
        configurable: true,
      })

      setupMocks({
        alerts: [
          {
            id: '1',
            text: 'Ir a portal',
            color: 'blue',
            actionLabel: 'Abrir',
            actionUrl: 'https://portal.example.com',
          },
        ],
      })
      render(<UserAlertsWidget />)
      fireEvent.click(screen.getByText('Abrir'))
      expect(assignMock).toHaveBeenCalledWith('https://portal.example.com')
    })

    it('no llama ni clockIn ni assign cuando no hay actionKind ni actionUrl', () => {
      const assignMock = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { assign: assignMock },
        writable: true,
        configurable: true,
      })

      setupMocks({
        alerts: [
          {
            id: '1',
            text: 'Solo texto',
            color: 'green',
            actionLabel: 'Click sin efecto',
          },
        ],
      })
      render(<UserAlertsWidget />)
      fireEvent.click(screen.getByText('Click sin efecto'))
      expect(clockInMock).not.toHaveBeenCalled()
      expect(assignMock).not.toHaveBeenCalled()
    })
  })

  describe('colores de alerta', () => {
    it('aplica clases de color amber', () => {
      setupMocks({
        alerts: [{ id: '1', text: 'Alerta amber', color: 'amber' }],
      })
      const { container } = render(<UserAlertsWidget />)
      const alertDiv = container.querySelector('.bg-warning-light')
      expect(alertDiv).not.toBeNull()
    })

    it('aplica clases de color red', () => {
      setupMocks({
        alerts: [{ id: '1', text: 'Alerta red', color: 'red' }],
      })
      const { container } = render(<UserAlertsWidget />)
      const alertDiv = container.querySelector('.bg-danger-light')
      expect(alertDiv).not.toBeNull()
    })

    it('usa clases blue como fallback para color desconocido', () => {
      mockUseUserAlerts.mockReturnValue({
        alerts: [{ id: '1', text: 'Unknown color', color: 'purple' as any }],
        loading: false,
        dismiss: dismissMock,
        clockIn: clockInMock,
      })
      const { container } = render(<UserAlertsWidget />)
      const alertDiv = container.querySelector('.bg-info-light')
      expect(alertDiv).not.toBeNull()
    })
  })
})
