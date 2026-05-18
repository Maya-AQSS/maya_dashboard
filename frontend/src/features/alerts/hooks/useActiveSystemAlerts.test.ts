import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../../api/http', () => {
  class ApiHttpError extends Error {
    status: number
    constructor(status: number, message = '') {
      super(message)
      this.status = status
    }
  }
  return {
    ApiHttpError,
    apiGetJson: vi.fn(),
  }
})

import { useAuth } from '@maya/shared-auth-react'
import { apiGetJson } from '../../../api/http'
import { useActiveSystemAlerts } from './useActiveSystemAlerts'

const mockUseAuth = vi.mocked(useAuth)
const mockApiGetJson = vi.mocked(apiGetJson)

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
}

describe('useActiveSystemAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('sin autenticar (token null)', () => {
    it('no ejecuta la query y devuelve alerts vacío', () => {
      mockUseAuth.mockReturnValue({ token: null, user: null } as any)
      const qc = makeClient()
      const { result } = renderHook(() => useActiveSystemAlerts(), { wrapper: makeWrapper(qc) })

      expect(result.current.alerts).toHaveLength(0)
      expect(mockApiGetJson).not.toHaveBeenCalled()
    })

    it('devuelve alerts vacío cuando no hay token (query deshabilitada)', () => {
      mockUseAuth.mockReturnValue({ token: null, user: null } as any)
      const qc = makeClient()
      const { result } = renderHook(() => useActiveSystemAlerts(), { wrapper: makeWrapper(qc) })

      // When enabled=false, TanStack Query keeps isPending=true (no data);
      // the hook defaults alerts to [] which is the relevant contract.
      expect(result.current.alerts).toHaveLength(0)
    })
  })

  describe('con usuario autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ token: 'tok-123', user: { sub: 'u1' } } as any)
    })

    it('mapea las alertas del backend a AlertItem', async () => {
      mockApiGetJson.mockResolvedValueOnce({
        data: [
          { id: 1, severity: 'critical', title: 'CPU alta', source: 'monitor' },
          { id: 2, severity: 'medium', title: null, source: 'disk' },
          { id: 3, severity: 'low', title: null, source: null },
        ],
      })
      const qc = makeClient()
      const { result } = renderHook(() => useActiveSystemAlerts(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })

      expect(result.current.alerts).toHaveLength(3)
      expect(result.current.alerts[0].id).toBe('srv:1')
      expect(result.current.alerts[0].color).toBe('red')
      expect(result.current.alerts[0].text).toBe('CPU alta')
      expect(result.current.alerts[0].canDismiss).toBe(true)
      expect(result.current.alerts[0].actionLabel).toBeNull()
    })

    it('mapea severity "high" a color red', async () => {
      mockApiGetJson.mockResolvedValueOnce({
        data: [{ id: 10, severity: 'high', title: 'RAM alta', source: 'mem' }],
      })
      const qc = makeClient()
      const { result } = renderHook(() => useActiveSystemAlerts(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })
      expect(result.current.alerts[0].color).toBe('red')
    })

    it('mapea severity "medium" a color amber', async () => {
      mockApiGetJson.mockResolvedValueOnce({
        data: [{ id: 11, severity: 'medium', title: 'Disco', source: 'disk' }],
      })
      const qc = makeClient()
      const { result } = renderHook(() => useActiveSystemAlerts(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })
      expect(result.current.alerts[0].color).toBe('amber')
    })

    it('mapea severity desconocida (low, info) a color blue', async () => {
      mockApiGetJson.mockResolvedValueOnce({
        data: [{ id: 12, severity: 'low', title: 'Info', source: 'net' }],
      })
      const qc = makeClient()
      const { result } = renderHook(() => useActiveSystemAlerts(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })
      expect(result.current.alerts[0].color).toBe('blue')
    })

    it('usa source como fallback cuando title es null', async () => {
      mockApiGetJson.mockResolvedValueOnce({
        data: [{ id: 13, severity: 'low', title: null, source: 'my-source' }],
      })
      const qc = makeClient()
      const { result } = renderHook(() => useActiveSystemAlerts(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })
      expect(result.current.alerts[0].text).toBe('my-source')
    })

    it('usa texto de fallback cuando title y source son null', async () => {
      mockApiGetJson.mockResolvedValueOnce({
        data: [{ id: 14, severity: 'low', title: null, source: null }],
      })
      const qc = makeClient()
      const { result } = renderHook(() => useActiveSystemAlerts(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })
      expect(result.current.alerts[0].text).toBe('Alerta del sistema')
    })

    it('devuelve array vacío cuando payload.data no es un array', async () => {
      mockApiGetJson.mockResolvedValueOnce({ data: null })
      const qc = makeClient()
      const { result } = renderHook(() => useActiveSystemAlerts(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })
      expect(result.current.alerts).toHaveLength(0)
    })

    it('devuelve array vacío cuando payload es undefined', async () => {
      mockApiGetJson.mockResolvedValueOnce(undefined)
      const qc = makeClient()
      const { result } = renderHook(() => useActiveSystemAlerts(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })
      expect(result.current.alerts).toHaveLength(0)
    })
  })
})
