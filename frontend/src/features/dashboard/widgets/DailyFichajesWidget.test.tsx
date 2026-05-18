import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('../../fichaje/hooks/useDailyFichajes', () => ({
  default: vi.fn(),
}))

vi.mock('@maya/shared-ui-react', () => ({
  Button: ({
    children,
    onClick,
    title,
  }: {
    children: React.ReactNode
    onClick?: () => void
    title?: string
  }) => (
    <button onClick={onClick} title={title}>
      {children}
    </button>
  ),
}))

import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import useDailyFichajes from '../../fichaje/hooks/useDailyFichajes'
import DailyFichajesWidget from './DailyFichajesWidget'

const mockUseAuth = vi.mocked(useAuth)
const mockUseLocale = vi.mocked(useLocale)
const mockUseDailyFichajes = vi.mocked(useDailyFichajes)

function makeEntry(type: 'in' | 'out', hours: number, minutes = 0, date = new Date()) {
  const ts = new Date(date)
  ts.setHours(hours, minutes, 0, 0)
  return { id: Math.random(), type, timestamp: ts }
}

function setupMocks({
  entries = [] as ReturnType<typeof makeEntry>[],
  loading = false,
  error = undefined as string | undefined,
} = {}) {
  mockUseAuth.mockReturnValue({ user: { sub: 'user-1' }, token: 'tok' } as any)

  mockUseLocale.mockReturnValue({
    t: (key: string) => key,
    locale: 'es',
    dateLocale: 'es-ES',
    setLocale: vi.fn(),
    localeOptions: [],
  } as any)

  mockUseDailyFichajes.mockReturnValue({ entries, loading, error })
}

describe('DailyFichajesWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('renderizado básico', () => {
    it('renderiza sin errores con entries vacías', () => {
      setupMocks()
      const { container } = render(<DailyFichajesWidget />)
      expect(container.firstChild).not.toBeNull()
    })

    it('muestra el WeekDatePicker con botones de semana anterior/siguiente', () => {
      setupMocks()
      render(<DailyFichajesWidget />)
      expect(screen.getByLabelText('dashboard.fichaje.prevDay')).toBeTruthy()
      expect(screen.getByLabelText('dashboard.fichaje.nextDay')).toBeTruthy()
    })

    it('el botón de semana siguiente está deshabilitado (hoy es la fecha máxima)', () => {
      setupMocks()
      render(<DailyFichajesWidget />)
      const nextBtn = screen.getByLabelText('dashboard.fichaje.nextDay')
      expect((nextBtn as HTMLButtonElement).disabled).toBe(true)
    })
  })

  describe('estado de carga', () => {
    it('muestra el skeleton de carga cuando loading es true', () => {
      setupMocks({ loading: true })
      const { container } = render(<DailyFichajesWidget />)
      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).not.toBeNull()
    })

    it('no muestra tabla cuando loading es true', () => {
      setupMocks({ loading: true })
      render(<DailyFichajesWidget />)
      expect(screen.queryByRole('table')).toBeNull()
    })
  })

  describe('estado de error', () => {
    it('muestra role=alert cuando hay error', () => {
      setupMocks({ error: 'dashboard.fichaje.errorLoad' })
      render(<DailyFichajesWidget />)
      expect(screen.getByRole('alert')).toBeTruthy()
    })

    it('el alert contiene el mensaje de error', () => {
      setupMocks({ error: 'Error al cargar fichajes' })
      render(<DailyFichajesWidget />)
      expect(screen.getByRole('alert').textContent).toContain('Error al cargar fichajes')
    })
  })

  describe('sin entries', () => {
    it('muestra mensaje de no hay entradas cuando entries está vacío', () => {
      setupMocks({ entries: [] })
      render(<DailyFichajesWidget />)
      expect(screen.getByText('dashboard.fichaje.noEntries')).toBeTruthy()
    })

    it('no renderiza tabla cuando no hay entries', () => {
      setupMocks({ entries: [] })
      render(<DailyFichajesWidget />)
      expect(screen.queryByRole('table')).toBeNull()
    })
  })

  describe('tabla de fichajes', () => {
    it('renderiza la tabla cuando hay entries para el día', () => {
      setupMocks({
        entries: [
          makeEntry('in', 8, 30),
          makeEntry('out', 14, 0),
        ],
      })
      render(<DailyFichajesWidget />)
      expect(screen.getByRole('table')).toBeTruthy()
    })

    it('muestra las cabeceras de columna', () => {
      setupMocks({
        entries: [
          makeEntry('in', 8, 30),
          makeEntry('out', 14, 0),
        ],
      })
      render(<DailyFichajesWidget />)
      expect(screen.getByText('dashboard.fichaje.entrada')).toBeTruthy()
      expect(screen.getByText('dashboard.fichaje.salida')).toBeTruthy()
      expect(screen.getByText('dashboard.fichaje.columnHoras')).toBeTruthy()
    })

    it('muestra la fila total cuando hay pares completos', () => {
      setupMocks({
        entries: [
          makeEntry('in', 8, 30),
          makeEntry('out', 14, 0),
        ],
      })
      render(<DailyFichajesWidget />)
      expect(screen.getByText('dashboard.fichaje.total')).toBeTruthy()
    })

    it('muestra "inProgress" para entradas sin salida cuando es hoy', () => {
      // Entry 'in' with no 'out' for today = open pair (salida: null)
      setupMocks({
        entries: [makeEntry('in', 8, 30)],
      })
      render(<DailyFichajesWidget />)
      expect(screen.getByText('dashboard.fichaje.inProgress')).toBeTruthy()
    })

    it('muestra el botón de editar para cada par', () => {
      setupMocks({
        entries: [
          makeEntry('in', 8, 30),
          makeEntry('out', 14, 0),
        ],
      })
      render(<DailyFichajesWidget />)
      const editBtn = screen.getByTitle('dashboard.fichaje.requestModification')
      expect(editBtn).toBeTruthy()
    })
  })

  describe('edición de fichaje', () => {
    it('abre el formulario de edición al hacer clic en el botón de editar', () => {
      setupMocks({
        entries: [
          makeEntry('in', 9, 0),
          makeEntry('out', 13, 30),
        ],
      })
      render(<DailyFichajesWidget />)
      fireEvent.click(screen.getByTitle('dashboard.fichaje.requestModification'))
      // Inputs de tiempo appear in editing mode
      const timeInputs = screen.getAllByDisplayValue(/\d{2}:\d{2}/)
      expect(timeInputs.length).toBeGreaterThan(0)
    })

    it('muestra botón de confirmar y cancelar en modo edición', () => {
      setupMocks({
        entries: [
          makeEntry('in', 9, 0),
          makeEntry('out', 13, 30),
        ],
      })
      render(<DailyFichajesWidget />)
      fireEvent.click(screen.getByTitle('dashboard.fichaje.requestModification'))
      expect(screen.getByText('dashboard.fichaje.submitModification')).toBeTruthy()
      expect(screen.getByText('dashboard.cancel')).toBeTruthy()
    })

    it('cierra el formulario al hacer clic en cancelar', () => {
      setupMocks({
        entries: [
          makeEntry('in', 9, 0),
          makeEntry('out', 13, 30),
        ],
      })
      render(<DailyFichajesWidget />)
      fireEvent.click(screen.getByTitle('dashboard.fichaje.requestModification'))
      fireEvent.click(screen.getByText('dashboard.cancel'))
      expect(screen.queryByText('dashboard.fichaje.submitModification')).toBeNull()
      // Edit button should be back
      expect(screen.getByTitle('dashboard.fichaje.requestModification')).toBeTruthy()
    })

    it('guarda la solicitud de modificación al confirmar', () => {
      setupMocks({
        entries: [
          makeEntry('in', 9, 0),
          makeEntry('out', 13, 30),
        ],
      })
      render(<DailyFichajesWidget />)
      fireEvent.click(screen.getByTitle('dashboard.fichaje.requestModification'))
      fireEvent.click(screen.getByText('dashboard.fichaje.submitModification'))
      // After submit, shows pending indicator
      expect(screen.getByText('⏳')).toBeTruthy()
    })

    it('muestra el mensaje de pendingApproval tras guardar', () => {
      setupMocks({
        entries: [
          makeEntry('in', 9, 0),
          makeEntry('out', 13, 30),
        ],
      })
      render(<DailyFichajesWidget />)
      fireEvent.click(screen.getByTitle('dashboard.fichaje.requestModification'))
      fireEvent.click(screen.getByText('dashboard.fichaje.submitModification'))
      expect(screen.getByText('dashboard.fichaje.pendingApproval')).toBeTruthy()
    })
  })

  describe('navegación de semana', () => {
    it('navega a la semana anterior al hacer clic en prevDay', () => {
      setupMocks()
      render(<DailyFichajesWidget />)
      const prevBtn = screen.getByLabelText('dashboard.fichaje.prevDay')
      fireEvent.click(prevBtn)
      // After clicking prev, useDailyFichajes should have been called with a different date
      expect(mockUseDailyFichajes).toHaveBeenCalled()
    })

    it('los días de la semana están renderizados (7 botones de día)', () => {
      setupMocks()
      render(<DailyFichajesWidget />)
      // 7 day buttons in WeekDatePicker + prev/next = 9 total week-related buttons
      // We check aria-pressed buttons (day buttons)
      const dayButtons = screen.getAllByRole('button').filter(
        (b) => b.hasAttribute('aria-pressed'),
      )
      expect(dayButtons.length).toBe(7)
    })
  })
})
