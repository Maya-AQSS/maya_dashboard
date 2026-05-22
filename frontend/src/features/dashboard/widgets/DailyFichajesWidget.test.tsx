import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

vi.mock('@maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('../../user-profile', () => ({
  useUserProfile: vi.fn(() => ({
    profile: { id: 'user-1', name: 'Sophia Jones', email: 'sophia@ceedcv.es', locale: 'es' },
  })),
  profileDisplayInitials: vi.fn(() => 'SJ'),
}))

vi.mock('../../fichaje/hooks/useDailyFichajes', () => ({
  default: vi.fn(),
}))

vi.mock('../../fichaje/api/clockInApi', () => ({
  postClockIn: vi.fn().mockResolvedValue({}),
  postClockOut: vi.fn().mockResolvedValue({}),
}))

vi.mock('@maya/shared-ui-react', () => ({
  Button: ({
    children,
    onClick,
    title,
    disabled,
  }: {
    children: ReactNode
    onClick?: () => void
    title?: string
    disabled?: boolean
  }) => (
    <button onClick={onClick} title={title} disabled={disabled}>
      {children}
    </button>
  ),
}))

import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import useDailyFichajes from '../../fichaje/hooks/useDailyFichajes'
import { postClockIn, postClockOut } from '../../fichaje/api/clockInApi'
import DailyFichajesWidget from './DailyFichajesWidget'

const mockUseAuth = vi.mocked(useAuth)
const mockUseLocale = vi.mocked(useLocale)
const mockUseDailyFichajes = vi.mocked(useDailyFichajes)
const mockPostClockIn = vi.mocked(postClockIn)
const mockPostClockOut = vi.mocked(postClockOut)

function makeEntry(type: 'in' | 'out', hours: number, minutes = 0, date = new Date()) {
  const ts = new Date(date)
  ts.setHours(hours, minutes, 0, 0)
  return { type, timestamp: ts }
}

function setupMocks({
  entries = [] as ReturnType<typeof makeEntry>[],
  loading = false,
  error = undefined as string | undefined,
} = {}) {
  mockUseAuth.mockReturnValue({ user: { sub: 'user-1' }, token: 'tok' } as never)

  mockUseLocale.mockReturnValue({
    t: (key: string) => key,
    locale: 'es',
    dateLocale: 'es-ES',
    setLocale: vi.fn(),
    localeOptions: [],
  } as never)

  mockUseDailyFichajes.mockReturnValue({ entries, loading, error })
}

function renderWidget() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <DailyFichajesWidget />
    </QueryClientProvider>,
  )
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
      const { container } = renderWidget()
      expect(container.firstChild).not.toBeNull()
    })

    it('muestra el título del widget', () => {
      renderWidget()
      expect(screen.getByText('dashboard.fichaje.dailyTitle')).toBeTruthy()
    })

    it('muestra la etiqueta de total trabajado', () => {
      renderWidget()
      expect(screen.getByText('dashboard.fichaje.totalWorked')).toBeTruthy()
    })
  })

  describe('estado de carga', () => {
    it('muestra el skeleton de carga cuando loading es true', () => {
      setupMocks({ loading: true })
      const { container } = renderWidget()
      const skeleton = container.querySelector('.animate-pulse')
      expect(skeleton).not.toBeNull()
    })
  })

  describe('estado de error', () => {
    it('muestra role=alert cuando hay error', () => {
      setupMocks({ error: 'Error al cargar fichajes' })
      renderWidget()
      const alert = screen.getByRole('alert')
      expect(alert.textContent).toContain('Error al cargar fichajes')
    })
  })

  describe('sin entries (hoy)', () => {
    it('muestra mensaje de no hay entradas', () => {
      setupMocks({ entries: [] })
      renderWidget()
      expect(screen.getByText('dashboard.fichaje.noEntries')).toBeTruthy()
    })

    it('muestra el botón Fichar como CTA central', () => {
      setupMocks({ entries: [] })
      renderWidget()
      expect(screen.getByText('dashboard.fichaje.clockInButton')).toBeTruthy()
    })

    it('clicar el CTA invoca postClockIn', async () => {
      setupMocks({ entries: [] })
      renderWidget()
      fireEvent.click(screen.getByText('dashboard.fichaje.clockInButton'))
      await waitFor(() => expect(mockPostClockIn).toHaveBeenCalledWith('user-1'))
    })
  })

  describe('timeline con pares cerrados', () => {
    it('renderiza eventos entrada y salida', () => {
      setupMocks({
        entries: [makeEntry('in', 8, 30), makeEntry('out', 14, 0)],
      })
      renderWidget()
      const entradas = screen.getAllByText('dashboard.fichaje.entrada')
      const salidas = screen.getAllByText('dashboard.fichaje.salida')
      expect(entradas.length).toBeGreaterThan(0)
      expect(salidas.length).toBeGreaterThan(0)
    })

    it('muestra el botón Fichar entrada cuando el último par está cerrado', () => {
      setupMocks({
        entries: [makeEntry('in', 8, 30), makeEntry('out', 14, 0)],
      })
      renderWidget()
      expect(screen.getByText('dashboard.fichaje.clockInButton')).toBeTruthy()
    })
  })

  describe('timeline con par abierto', () => {
    it('muestra "inProgress" sobre el último evento de entrada abierto', () => {
      setupMocks({ entries: [makeEntry('in', 8, 30)] })
      renderWidget()
      expect(screen.getByText('states.inProgress')).toBeTruthy()
    })

    it('muestra el botón Fichar salida', () => {
      setupMocks({ entries: [makeEntry('in', 8, 30)] })
      renderWidget()
      expect(screen.getByText('dashboard.fichaje.clockOutButton')).toBeTruthy()
    })

    it('clicar Fichar salida invoca postClockOut', async () => {
      setupMocks({ entries: [makeEntry('in', 8, 30)] })
      renderWidget()
      fireEvent.click(screen.getByText('dashboard.fichaje.clockOutButton'))
      await waitFor(() => expect(mockPostClockOut).toHaveBeenCalledWith('user-1'))
    })
  })

  describe('edición de fichaje', () => {
    it('abre el formulario inline al pulsar editar', () => {
      setupMocks({
        entries: [makeEntry('in', 9, 0), makeEntry('out', 13, 30)],
      })
      renderWidget()
      const editButtons = screen.getAllByTitle('dashboard.fichaje.requestModification')
      fireEvent.click(editButtons[0])
      expect(screen.getByText('dashboard.fichaje.submitModification')).toBeTruthy()
      expect(screen.getByText('actions.cancel')).toBeTruthy()
    })

    it('guarda la solicitud y muestra pendingApproval', () => {
      setupMocks({
        entries: [makeEntry('in', 9, 0), makeEntry('out', 13, 30)],
      })
      renderWidget()
      const editButtons = screen.getAllByTitle('dashboard.fichaje.requestModification')
      fireEvent.click(editButtons[0])
      fireEvent.click(screen.getByText('dashboard.fichaje.submitModification'))
      expect(screen.getByText('dashboard.fichaje.pendingApproval')).toBeTruthy()
    })

    it('cierra el formulario al cancelar', () => {
      setupMocks({
        entries: [makeEntry('in', 9, 0), makeEntry('out', 13, 30)],
      })
      renderWidget()
      const editButtons = screen.getAllByTitle('dashboard.fichaje.requestModification')
      fireEvent.click(editButtons[0])
      fireEvent.click(screen.getByText('actions.cancel'))
      expect(screen.queryByText('dashboard.fichaje.submitModification')).toBeNull()
    })
  })
})
