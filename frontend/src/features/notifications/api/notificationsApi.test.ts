import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../api/http', () => {
  class ApiHttpError extends Error {
    status: number
    constructor(status: number, message = `HTTP ${status}`) {
      super(message)
      this.name = 'ApiHttpError'
      this.status = status
    }
  }

  return {
    ApiHttpError,
    apiGetJson: vi.fn(),
    apiFetchJson: vi.fn(),
    mapApiError: (err: unknown, prefix: string, fallback = 'errorLoad'): Error => {
      if (err instanceof ApiHttpError) {
        if (err.status === 401) return new Error(`${prefix}.errorUnauthorized`)
        if (err.status === 403) return new Error(`${prefix}.errorForbidden`)
        if (err.status === 404) return new Error(`${prefix}.errorNotFound`)
        if (err.status === 422) return new Error(`${prefix}.errorValidation`)
        if (err.status >= 500) return new Error(`${prefix}.errorServer`)
      }
      if (err instanceof TypeError) return new Error(`${prefix}.errorNetwork`)
      return new Error(`${prefix}.${fallback}`)
    },
  }
})

import {
  listNotifications,
  getNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from './notificationsApi'
import { ApiHttpError, apiFetchJson, apiGetJson } from '../../../api/http'

describe('notificationsApi', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─── listNotifications ─────────────────────────────────────────────
  describe('listNotifications', () => {
    it('GET al endpoint /notifications sin filtros y transforma la respuesta plana', async () => {
      const raw = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 25,
        total: 0,
        from: null,
        to: null,
      }
      vi.mocked(apiGetJson).mockResolvedValue(raw)

      const result = await listNotifications()

      // Sin filtros, buildQueryString devuelve '' → URL limpia sin '?' colgante.
      expect(apiGetJson).toHaveBeenCalledWith('/notifications')
      expect(result).toEqual({
        data: [],
        meta: { current_page: 1, last_page: 1, per_page: 25, total: 0, from: null, to: null },
      })
    })

    it('incluye unread_only=1 cuando se indica', async () => {
      vi.mocked(apiGetJson).mockResolvedValue({ data: [], current_page: 1, last_page: 1, per_page: 25, total: 0, from: null, to: null })

      await listNotifications({ unread_only: true })

      expect(apiGetJson).toHaveBeenCalledWith(expect.stringContaining('unread_only=1'))
    })

    it('incluye search en el querystring', async () => {
      vi.mocked(apiGetJson).mockResolvedValue({ data: [], current_page: 1, last_page: 1, per_page: 25, total: 0, from: null, to: null })

      await listNotifications({ search: 'aviso' })

      const url = vi.mocked(apiGetJson).mock.calls[0][0] as string
      expect(url).toContain('search=aviso')
    })

    it('mapea 401 → notifications.errorUnauthorized', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(401))

      await expect(listNotifications()).rejects.toThrow('notifications.errorUnauthorized')
    })

    it('mapea 500 → notifications.errorServer', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(500))

      await expect(listNotifications()).rejects.toThrow('notifications.errorServer')
    })

    it('mapea TypeError → notifications.errorNetwork', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new TypeError('fetch failed'))

      await expect(listNotifications()).rejects.toThrow('notifications.errorNetwork')
    })
  })

  // ─── getNotification ───────────────────────────────────────────────
  describe('getNotification', () => {
    it('GET al endpoint /notifications/{id} y desenvuelve data', async () => {
      const notif = { id: 42, title: 'Aviso', app: 'maya_auth' }
      vi.mocked(apiGetJson).mockResolvedValue({ data: notif })

      const result = await getNotification(42)

      expect(apiGetJson).toHaveBeenCalledWith('/notifications/42')
      expect(result).toBe(notif)
    })

    it('mapea 404 → notifications.errorNotFound', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(404))

      await expect(getNotification(99)).rejects.toThrow('notifications.errorNotFound')
    })
  })

  // ─── markNotificationRead ──────────────────────────────────────────
  describe('markNotificationRead', () => {
    it('POST al endpoint /notifications/{id}/read y desenvuelve data', async () => {
      const notif = { id: 7, read_at: '2026-05-27T10:00:00Z' }
      vi.mocked(apiFetchJson).mockResolvedValue({ data: notif })

      const result = await markNotificationRead(7)

      expect(apiFetchJson).toHaveBeenCalledWith('/notifications/7/read', { method: 'POST' })
      expect(result).toBe(notif)
    })

    it('mapea 401 → notifications.errorUnauthorized', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(401))

      await expect(markNotificationRead(1)).rejects.toThrow('notifications.errorUnauthorized')
    })
  })

  // ─── markAllNotificationsRead ──────────────────────────────────────
  describe('markAllNotificationsRead', () => {
    it('POST al endpoint /notifications/mark-all-read y desenvuelve data', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue({ data: { updated: 5 } })

      const result = await markAllNotificationsRead()

      expect(apiFetchJson).toHaveBeenCalledWith('/notifications/mark-all-read', { method: 'POST' })
      expect(result).toEqual({ updated: 5 })
    })
  })

  // ─── getUnreadCount ────────────────────────────────────────────────
  describe('getUnreadCount', () => {
    it('GET al endpoint /notifications/unread-count y desenvuelve data', async () => {
      vi.mocked(apiGetJson).mockResolvedValue({ data: { unread: 3 } })

      const result = await getUnreadCount()

      expect(apiGetJson).toHaveBeenCalledWith('/notifications/unread-count')
      expect(result).toEqual({ unread: 3 })
    })

    it('mapea 401 → notifications.errorUnauthorized', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(401))

      await expect(getUnreadCount()).rejects.toThrow('notifications.errorUnauthorized')
    })
  })
})
