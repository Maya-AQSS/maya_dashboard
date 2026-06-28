import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock child hooks / api so useUserAlerts can be tested in isolation.
vi.mock('../../notifications/hooks/useCriticalAlerts', () => ({
  useCriticalAlerts: vi.fn(),
}))

vi.mock('./useFichajeAlerts', () => ({
  useFichajeAlerts: vi.fn(),
}))

vi.mock('../../panel-alerts/api/panelAlertsApi', () => ({
  getActivePanelAlerts: vi.fn(async () => []),
}))

vi.mock('@ceedcv-maya/shared-auth-react', () => ({
  useAuth: () => ({ token: 'test-token', user: { sub: 'user-1' } }),
}))

import { useCriticalAlerts } from '../../notifications/hooks/useCriticalAlerts'
import { useFichajeAlerts } from './useFichajeAlerts'
import { getActivePanelAlerts } from '../../panel-alerts/api/panelAlertsApi'
import { useUserAlerts } from './useUserAlerts'

const mockUseCriticalAlerts = vi.mocked(useCriticalAlerts)
const mockUseFichajeAlerts = vi.mocked(useFichajeAlerts)
const mockGetActivePanelAlerts = vi.mocked(getActivePanelAlerts)

const STORAGE_KEY = 'maya:dismissed-alerts'

// Critical alert id 1 → widget produces 'notif:1'.
const criticalAlert = {
  id: 1,
  title: 'CPU alta',
  body: '',
  severity: 'high',
  createdAt: '2026-06-01T00:00:00Z',
  acknowledged: false,
  canDismiss: true,
}

const fichajeAlert = {
  id: 'local:no-fichado',
  color: 'amber' as const,
  text: 'Ficha tu entrada',
  actionLabel: 'Fichar',
  actionKind: 'clockIn',
  canDismiss: true,
}

const clockInMock = vi.fn()

function setupMocks({
  criticalAlerts = [criticalAlert],
  criticalLoading = false,
  fichajeAlerts = [fichajeAlert],
}: {
  criticalAlerts?: typeof criticalAlert[]
  criticalLoading?: boolean
  fichajeAlerts?: typeof fichajeAlert[]
} = {}) {
  mockUseCriticalAlerts.mockReturnValue({
    alerts: criticalAlerts,
    loading: criticalLoading,
    error: null,
    refresh: vi.fn(),
  })
  mockUseFichajeAlerts.mockReturnValue({ alerts: fichajeAlerts, clockIn: clockInMock })
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client }, children)
}

const renderUserAlerts = () => renderHook(() => useUserAlerts(), { wrapper })

describe('useUserAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockGetActivePanelAlerts.mockResolvedValue([])
    setupMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('combinación de alertas', () => {
    it('combina fichaje y critical alerts en ese orden', () => {
      const { result } = renderUserAlerts()

      expect(result.current.alerts).toHaveLength(2)
      expect(result.current.alerts[0].id).toBe('local:no-fichado')
      expect(result.current.alerts[1].id).toBe('notif:1')
    })

    it('expone clockIn del hook de fichaje', () => {
      const { result } = renderUserAlerts()
      expect(result.current.clockIn).toBe(clockInMock)
    })

    it('propaga loading del hook de notificaciones críticas', () => {
      setupMocks({ criticalLoading: true })
      const { result } = renderUserAlerts()
      expect(result.current.loading).toBe(true)
    })

    it('devuelve loading=false cuando todo está listo', async () => {
      setupMocks({ criticalLoading: false })
      const { result } = renderUserAlerts()
      await waitFor(() => expect(result.current.loading).toBe(false))
    })
  })

  describe('dismiss de alertas', () => {
    it('dismiss elimina la alerta de la lista visible', () => {
      const { result } = renderUserAlerts()

      act(() => { result.current.dismiss('notif:1') })

      expect(result.current.alerts.find((a) => a.id === 'notif:1')).toBeUndefined()
    })

    it('dismiss persiste en localStorage', () => {
      const { result } = renderUserAlerts()

      act(() => { result.current.dismiss('notif:1') })

      const raw = localStorage.getItem(STORAGE_KEY)
      expect(raw).toBeTruthy()
      const entry = JSON.parse(raw!)
      expect(entry.ids).toContain('notif:1')
    })

    it('dismiss de id ya descartada no rompe nada', () => {
      const { result } = renderUserAlerts()

      act(() => {
        result.current.dismiss('notif:1')
        result.current.dismiss('notif:1')
      })

      expect(result.current.alerts.find((a) => a.id === 'notif:1')).toBeUndefined()
    })

    it('mantiene las alertas no descartadas después de dismiss', () => {
      const { result } = renderUserAlerts()

      act(() => { result.current.dismiss('notif:1') })

      expect(result.current.alerts.find((a) => a.id === 'local:no-fichado')).toBeTruthy()
    })
  })

  describe('carga de dismissed desde localStorage', () => {
    it('filtra alertas cuyo id está en localStorage al montar', () => {
      const entry = { ids: ['notif:1'], expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))

      const { result } = renderUserAlerts()

      expect(result.current.alerts.find((a) => a.id === 'notif:1')).toBeUndefined()
      expect(result.current.alerts.find((a) => a.id === 'local:no-fichado')).toBeTruthy()
    })

    it('ignora entrada de localStorage expirada', () => {
      const entry = { ids: ['notif:1'], expiresAt: Date.now() - 1000 }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))

      const { result } = renderUserAlerts()

      expect(result.current.alerts.find((a) => a.id === 'notif:1')).toBeTruthy()
    })

    it('maneja JSON inválido en localStorage sin lanzar error', () => {
      localStorage.setItem(STORAGE_KEY, 'NOT_JSON{{{')
      expect(() => renderUserAlerts()).not.toThrow()
    })

    it('con localStorage inválido muestra todas las alertas', () => {
      localStorage.setItem(STORAGE_KEY, 'BAD_JSON')

      const { result } = renderUserAlerts()

      expect(result.current.alerts).toHaveLength(2)
    })
  })

  describe('sin alertas', () => {
    it('devuelve array vacío cuando no hay alertas', () => {
      setupMocks({ criticalAlerts: [], fichajeAlerts: [] })
      const { result } = renderUserAlerts()
      expect(result.current.alerts).toHaveLength(0)
    })
  })
})
