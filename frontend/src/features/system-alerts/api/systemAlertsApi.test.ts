import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Mockeamos el wrapper local `../../../api/http`. La auth Bearer la inyecta
 * el cliente real basado en `@ceedcv-maya/shared-auth-react`; el módulo bajo test
 * solo construye la URL + querystring y traduce el error con `mapApiError`.
 */
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

import { listSystemAlerts, acknowledgeAlert, resolveAlert } from './systemAlertsApi'
import { ApiHttpError, apiFetchJson, apiGetJson } from '../../../api/http'

describe('systemAlertsApi', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─── listSystemAlerts ─────────────────────────────────────────────
  describe('listSystemAlerts', () => {
    it('GET al endpoint /alerts con active_only=1 por defecto', async () => {
      const payload = { data: [{ id: 1, title: 'CPU alta', severity: 'critical' }] }
      vi.mocked(apiGetJson).mockResolvedValue(payload)

      const result = await listSystemAlerts()

      expect(apiGetJson).toHaveBeenCalledWith('/alerts?active_only=1')
      expect(result).toBe(payload)
    })

    it('pasa active_only=0 cuando activeOnly es false', async () => {
      vi.mocked(apiGetJson).mockResolvedValue({ data: [] })

      await listSystemAlerts({ activeOnly: false })

      expect(apiGetJson).toHaveBeenCalledWith('/alerts?active_only=0')
    })

    it('incluye severity en el querystring cuando se proporciona', async () => {
      vi.mocked(apiGetJson).mockResolvedValue({ data: [] })

      await listSystemAlerts({ activeOnly: true, severity: 'high' })

      expect(apiGetJson).toHaveBeenCalledWith('/alerts?active_only=1&severity=high')
    })

    it('omite severity del querystring cuando no se proporciona', async () => {
      vi.mocked(apiGetJson).mockResolvedValue({ data: [] })

      await listSystemAlerts({ activeOnly: false })

      const calledUrl = vi.mocked(apiGetJson).mock.calls[0][0] as string
      expect(calledUrl).not.toContain('severity')
    })

    it('devuelve el payload tal cual lo retorna apiGetJson', async () => {
      const payload = [{ id: 2, title: 'Disco lleno' }]
      vi.mocked(apiGetJson).mockResolvedValue(payload)

      const result = await listSystemAlerts()

      expect(result).toBe(payload)
    })

    it('mapea 401 → alerts.errorUnauthorized', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(401))

      await expect(listSystemAlerts()).rejects.toThrow('alerts.errorUnauthorized')
    })

    it('mapea 403 → alerts.errorForbidden', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(403))

      await expect(listSystemAlerts()).rejects.toThrow('alerts.errorForbidden')
    })

    it('mapea 500 → alerts.errorServer', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(500))

      await expect(listSystemAlerts()).rejects.toThrow('alerts.errorServer')
    })

    it('mapea TypeError (network) → alerts.errorNetwork', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new TypeError('fetch failed'))

      await expect(listSystemAlerts()).rejects.toThrow('alerts.errorNetwork')
    })

    it('errores sin reconocer caen al fallback alerts.errorLoad', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new Error('boom'))

      await expect(listSystemAlerts()).rejects.toThrow('alerts.errorLoad')
    })
  })

  // ─── acknowledgeAlert ─────────────────────────────────────────────
  describe('acknowledgeAlert', () => {
    it('POST al endpoint /alerts/{id}/acknowledge', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue({ id: 42, acknowledged_at: '2026-05-17T10:00:00Z' })

      const result = await acknowledgeAlert({ id: 42 })

      expect(apiFetchJson).toHaveBeenCalledWith('/alerts/42/acknowledge', { method: 'POST' })
      expect(result).toEqual({ id: 42, acknowledged_at: '2026-05-17T10:00:00Z' })
    })

    it('acepta id string (slug)', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue({})

      await acknowledgeAlert({ id: 'alert-abc' })

      expect(apiFetchJson).toHaveBeenCalledWith('/alerts/alert-abc/acknowledge', { method: 'POST' })
    })

    it('mapea 401 → alerts.errorUnauthorized', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(401))

      await expect(acknowledgeAlert({ id: 1 })).rejects.toThrow('alerts.errorUnauthorized')
    })

    it('mapea 403 → alerts.errorForbidden', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(403))

      await expect(acknowledgeAlert({ id: 1 })).rejects.toThrow('alerts.errorForbidden')
    })

    it('mapea 500 → alerts.errorServer', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(500))

      await expect(acknowledgeAlert({ id: 1 })).rejects.toThrow('alerts.errorServer')
    })

    it('mapea TypeError (network) → alerts.errorNetwork', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new TypeError('network failure'))

      await expect(acknowledgeAlert({ id: 1 })).rejects.toThrow('alerts.errorNetwork')
    })

    it('errores sin reconocer caen al fallback alerts.errorLoad', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new Error('unexpected'))

      await expect(acknowledgeAlert({ id: 1 })).rejects.toThrow('alerts.errorLoad')
    })
  })

  // ─── resolveAlert ─────────────────────────────────────────────────
  describe('resolveAlert', () => {
    it('POST al endpoint /alerts/{id}/resolve', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue({ id: 7, resolved_at: '2026-05-17T11:00:00Z' })

      const result = await resolveAlert({ id: 7 })

      expect(apiFetchJson).toHaveBeenCalledWith('/alerts/7/resolve', { method: 'POST' })
      expect(result).toEqual({ id: 7, resolved_at: '2026-05-17T11:00:00Z' })
    })

    it('acepta id string', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue({})

      await resolveAlert({ id: 'alert-xyz' })

      expect(apiFetchJson).toHaveBeenCalledWith('/alerts/alert-xyz/resolve', { method: 'POST' })
    })

    it('mapea 401 → alerts.errorUnauthorized', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(401))

      await expect(resolveAlert({ id: 5 })).rejects.toThrow('alerts.errorUnauthorized')
    })

    it('mapea 403 → alerts.errorForbidden', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(403))

      await expect(resolveAlert({ id: 5 })).rejects.toThrow('alerts.errorForbidden')
    })

    it('mapea 500 → alerts.errorServer', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(500))

      await expect(resolveAlert({ id: 5 })).rejects.toThrow('alerts.errorServer')
    })

    it('mapea TypeError (network) → alerts.errorNetwork', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new TypeError('network failure'))

      await expect(resolveAlert({ id: 5 })).rejects.toThrow('alerts.errorNetwork')
    })

    it('errores sin reconocer caen al fallback alerts.errorLoad', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new Error('unknown'))

      await expect(resolveAlert({ id: 5 })).rejects.toThrow('alerts.errorLoad')
    })
  })
})
