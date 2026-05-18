import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Mockeamos las funciones de API para aislar el hook de la capa HTTP.
 * La integración real con TanStack Query se mantiene — sólo el fetcher
 * de datos está simulado.
 */
vi.mock('../api/systemAlertsApi', () => ({
  listSystemAlerts: vi.fn(),
  acknowledgeAlert: vi.fn(),
  resolveAlert: vi.fn(),
}))

import { listSystemAlerts, acknowledgeAlert, resolveAlert } from '../api/systemAlertsApi'
import { useSystemAlerts } from './useSystemAlerts'

const mockListSystemAlerts = vi.mocked(listSystemAlerts)
const mockAcknowledgeAlert = vi.mocked(acknowledgeAlert)
const mockResolveAlert = vi.mocked(resolveAlert)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useSystemAlerts', () => {
  beforeEach(() => {
    mockListSystemAlerts.mockResolvedValue({ data: [] })
    mockAcknowledgeAlert.mockResolvedValue({})
    mockResolveAlert.mockResolvedValue({})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─── Carga deshabilitada sin token ────────────────────────────────
  describe('sin token', () => {
    it('no llama listSystemAlerts cuando token no está definido', async () => {
      const { result } = renderHook(() => useSystemAlerts(), {
        wrapper: createWrapper(),
      })

      await new Promise((r) => setTimeout(r, 10))

      expect(mockListSystemAlerts).not.toHaveBeenCalled()
      expect(result.current.loading).toBe(false)
      expect(result.current.alerts).toEqual([])
    })

    it('loading es false cuando no hay token', () => {
      const { result } = renderHook(() => useSystemAlerts({ token: undefined }), {
        wrapper: createWrapper(),
      })

      expect(result.current.loading).toBe(false)
    })
  })

  // ─── Carga inicial con token ──────────────────────────────────────
  describe('carga inicial con token', () => {
    it('llama listSystemAlerts con los parámetros correctos', async () => {
      const alerts = [{ id: 1, title: 'CPU alta', severity: 'critical' }]
      mockListSystemAlerts.mockResolvedValue({ data: alerts })

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-abc', activeOnly: true, severity: 'critical' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(mockListSystemAlerts).toHaveBeenCalledWith({
        token: 'tok-abc',
        activeOnly: true,
        severity: 'critical',
      })
      expect(result.current.alerts).toEqual(alerts)
    })

    it('expone alerts vacío cuando data es undefined en la respuesta', async () => {
      mockListSystemAlerts.mockResolvedValue({})

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-abc' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(result.current.alerts).toEqual([])
    })

    it('expone error cuando listSystemAlerts lanza', async () => {
      mockListSystemAlerts.mockRejectedValue(new Error('alerts.errorServer'))

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-abc' }),
        { wrapper: createWrapper() },
      )

      // retry: 1 in hook means 2 total attempts before error surfaces
      await waitFor(() => expect(result.current.error).not.toBeNull(), { timeout: 5000 })

      expect(result.current.error).toBe('alerts.errorServer')
      expect(result.current.alerts).toEqual([])
    })

    it('usa fallback alerts.errorLoad si el error no tiene mensaje', async () => {
      mockListSystemAlerts.mockRejectedValue(new Error(''))

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-abc' }),
        { wrapper: createWrapper() },
      )

      // retry: 1 in hook means 2 total attempts before error surfaces
      await waitFor(() => expect(result.current.error).not.toBeNull(), { timeout: 5000 })

      expect(result.current.error).toBe('alerts.errorLoad')
    })

    it('no hay error cuando la carga es exitosa', async () => {
      mockListSystemAlerts.mockResolvedValue({ data: [{ id: 1 }] })

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-abc' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(result.current.error).toBeNull()
    })
  })

  // ─── onAcknowledge ────────────────────────────────────────────────
  describe('onAcknowledge', () => {
    it('llama acknowledgeAlert con el id correcto', async () => {
      mockAcknowledgeAlert.mockResolvedValue({ id: 5, acknowledged_at: '2026-05-17' })
      mockListSystemAlerts.mockResolvedValue({ data: [] })

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-abc' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.onAcknowledge(5)
      })

      expect(mockAcknowledgeAlert).toHaveBeenCalledWith({ token: 'tok-abc', id: 5 })
    })

    it('acepta id string', async () => {
      mockAcknowledgeAlert.mockResolvedValue({})
      mockListSystemAlerts.mockResolvedValue({ data: [] })

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-xyz' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.onAcknowledge('alert-abc')
      })

      expect(mockAcknowledgeAlert).toHaveBeenCalledWith({ token: 'tok-xyz', id: 'alert-abc' })
    })

    it('onAcknowledge éxito refresca la lista (re-llama listSystemAlerts)', async () => {
      mockAcknowledgeAlert.mockResolvedValue({})
      mockListSystemAlerts.mockResolvedValue({ data: [] })

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-abc' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.loading).toBe(false))
      const callsBefore = mockListSystemAlerts.mock.calls.length

      await act(async () => {
        await result.current.onAcknowledge(1)
      })

      await waitFor(() => {
        expect(mockListSystemAlerts.mock.calls.length).toBeGreaterThan(callsBefore)
      })
    })
  })

  // ─── onResolve ────────────────────────────────────────────────────
  describe('onResolve', () => {
    it('llama resolveAlert con el id correcto', async () => {
      mockResolveAlert.mockResolvedValue({ id: 3, resolved_at: '2026-05-17' })
      mockListSystemAlerts.mockResolvedValue({ data: [] })

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-abc' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.onResolve(3)
      })

      expect(mockResolveAlert).toHaveBeenCalledWith({ token: 'tok-abc', id: 3 })
    })

    it('onResolve éxito refresca la lista', async () => {
      mockResolveAlert.mockResolvedValue({})
      mockListSystemAlerts.mockResolvedValue({ data: [] })

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-abc' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.loading).toBe(false))
      const callsBefore = mockListSystemAlerts.mock.calls.length

      await act(async () => {
        await result.current.onResolve(7)
      })

      await waitFor(() => {
        expect(mockListSystemAlerts.mock.calls.length).toBeGreaterThan(callsBefore)
      })
    })
  })

  // ─── refresh ─────────────────────────────────────────────────────
  describe('refresh', () => {
    it('refresh invalida la query y re-llama listSystemAlerts', async () => {
      mockListSystemAlerts.mockResolvedValue({ data: [] })

      const { result } = renderHook(
        () => useSystemAlerts({ token: 'tok-abc' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.loading).toBe(false))
      const callsBefore = mockListSystemAlerts.mock.calls.length

      act(() => {
        result.current.refresh()
      })

      await waitFor(() => {
        expect(mockListSystemAlerts.mock.calls.length).toBeGreaterThan(callsBefore)
      })
    })
  })
})
