import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('../api/notificationsApi', () => ({
  listNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  getNotification: vi.fn(),
}))

import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notificationsApi'
import { useNotifications } from './useNotifications'

const mockListNotifications = vi.mocked(listNotifications)
const mockMarkNotificationRead = vi.mocked(markNotificationRead)
const mockMarkAllNotificationsRead = vi.mocked(markAllNotificationsRead)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const EMPTY_RESPONSE = {
  data: [],
  meta: { current_page: 1, last_page: 1, per_page: 25, total: 0, from: null, to: null },
}

describe('useNotifications', () => {
  beforeEach(() => {
    mockListNotifications.mockResolvedValue(EMPTY_RESPONSE)
    mockMarkNotificationRead.mockResolvedValue({ id: 1, read_at: new Date().toISOString() } as never)
    mockMarkAllNotificationsRead.mockResolvedValue({ updated: 0 })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('carga inicial', () => {
    it('llama listNotifications con los filtros recibidos', async () => {
      const { result } = renderHook(
        () => useNotifications({ unread_only: true }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(mockListNotifications).toHaveBeenCalledWith(
        expect.objectContaining({ unread_only: true }),
      )
    })

    it('expone notifications vacío cuando data está vacía', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() })

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.notifications).toEqual([])
    })

    it('expone meta de la respuesta paginada', async () => {
      const meta = { current_page: 2, last_page: 5, per_page: 10, total: 42, from: 11, to: 20 }
      mockListNotifications.mockResolvedValue({ data: [], meta })

      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() })

      await waitFor(() => expect(result.current.loading).toBe(false))
      expect(result.current.meta).toEqual(meta)
    })

    it('expone error cuando listNotifications lanza', async () => {
      mockListNotifications.mockRejectedValue(new Error('notifications.errorServer'))

      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() })

      await waitFor(() => expect(result.current.error).not.toBeNull(), { timeout: 5000 })
      expect(result.current.error).toBe('notifications.errorServer')
    })
  })

  describe('onMarkRead', () => {
    it('llama markNotificationRead con el id correcto', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.onMarkRead(5)
      })

      expect(mockMarkNotificationRead).toHaveBeenCalledWith(5)
    })

    it('refresca la lista tras marcar como leída', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.loading).toBe(false))
      const callsBefore = mockListNotifications.mock.calls.length

      await act(async () => {
        await result.current.onMarkRead(1)
      })

      await waitFor(() => {
        expect(mockListNotifications.mock.calls.length).toBeGreaterThan(callsBefore)
      })
    })
  })

  describe('onMarkAllRead', () => {
    it('llama markAllNotificationsRead', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.onMarkAllRead()
      })

      expect(mockMarkAllNotificationsRead).toHaveBeenCalled()
    })

    it('refresca la lista tras marcar todas como leídas', async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() })
      await waitFor(() => expect(result.current.loading).toBe(false))
      const callsBefore = mockListNotifications.mock.calls.length

      await act(async () => {
        await result.current.onMarkAllRead()
      })

      await waitFor(() => {
        expect(mockListNotifications.mock.calls.length).toBeGreaterThan(callsBefore)
      })
    })
  })
})
