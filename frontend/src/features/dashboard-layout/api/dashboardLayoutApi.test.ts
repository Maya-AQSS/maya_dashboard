import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * Mockeamos el wrapper local `../../../api/http`. La auth Bearer la inyecta
 * el cliente real (`createApiClient(keycloak, baseUrl)`); el módulo bajo
 * test sólo construye la URL y traduce el error vía `mapApiError`.
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

import { getDashboardLayout, updateDashboardLayout } from './dashboardLayoutApi'
import { ApiHttpError, apiFetchJson, apiGetJson } from '../../../api/http'

describe('dashboardLayoutApi', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─── getDashboardLayout ──────────────────────────────────────────
  describe('getDashboardLayout', () => {
    it('GET al endpoint /dashboard/user/{id}/dashboard-layout y devuelve payload', async () => {
      const payload = { layout: [{ i: 'w1', x: 0, y: 0, w: 4, h: 3 }], updated_at: '2026-01-01' }
      vi.mocked(apiGetJson).mockResolvedValue(payload)

      const result = await getDashboardLayout('u-123', 'tok-abc')

      expect(apiGetJson).toHaveBeenCalledWith('/dashboard/user/u-123/dashboard-layout')
      expect(result).toBe(payload)
    })

    it('encodea userId con caracteres especiales en la URL', async () => {
      vi.mocked(apiGetJson).mockResolvedValue({})

      await getDashboardLayout('u/with space')

      expect(apiGetJson).toHaveBeenCalledWith('/dashboard/user/u%2Fwith%20space/dashboard-layout')
    })

    it('rechaza con dashboardLayout.errorLoad si userId vacío (no llama API)', async () => {
      await expect(getDashboardLayout('')).rejects.toThrow('dashboardLayout.errorLoad')
      expect(apiGetJson).not.toHaveBeenCalled()
    })

    it('mapea 401 → dashboardLayout.errorUnauthorized', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(401))

      await expect(getDashboardLayout('u-123')).rejects.toThrow('dashboardLayout.errorUnauthorized')
    })

    it('mapea 403 → dashboardLayout.errorForbidden', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(403))

      await expect(getDashboardLayout('u-123')).rejects.toThrow('dashboardLayout.errorForbidden')
    })

    it('mapea 500 → dashboardLayout.errorServer', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(500))

      await expect(getDashboardLayout('u-123')).rejects.toThrow('dashboardLayout.errorServer')
    })

    it('mapea TypeError (network) → dashboardLayout.errorNetwork', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new TypeError('fetch failed'))

      await expect(getDashboardLayout('u-123')).rejects.toThrow('dashboardLayout.errorNetwork')
    })

    it('errores no reconocidos caen al fallback errorLoad', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new Error('boom'))

      await expect(getDashboardLayout('u-123')).rejects.toThrow('dashboardLayout.errorLoad')
    })
  })

  // ─── updateDashboardLayout ──────────────────────────────────────
  describe('updateDashboardLayout', () => {
    it('PUT al endpoint con body { layout }', async () => {
      const layout = [{ i: 'w1', x: 0, y: 0, w: 6, h: 4 }]
      const response = { layout, updated_at: '2026-01-02' }
      vi.mocked(apiFetchJson).mockResolvedValue(response)

      const result = await updateDashboardLayout('u-123', layout, 'tok-abc')

      expect(apiFetchJson).toHaveBeenCalledWith(
        '/dashboard/user/u-123/dashboard-layout',
        { method: 'PUT', body: { layout } },
      )
      expect(result).toBe(response)
    })

    it('acepta layout array vacío', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue({ layout: [] })

      await updateDashboardLayout('u-123', [])

      expect(apiFetchJson).toHaveBeenCalledWith(
        '/dashboard/user/u-123/dashboard-layout',
        { method: 'PUT', body: { layout: [] } },
      )
    })

    it('rechaza con dashboardLayout.errorSave si userId vacío (no llama API)', async () => {
      await expect(updateDashboardLayout('', [])).rejects.toThrow('dashboardLayout.errorSave')
      expect(apiFetchJson).not.toHaveBeenCalled()
    })

    it('mapea 401 → dashboardLayout.errorUnauthorized', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(401))

      await expect(updateDashboardLayout('u-123', [])).rejects.toThrow('dashboardLayout.errorUnauthorized')
    })

    it('mapea 422 → dashboardLayout.errorValidation', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(422))

      await expect(updateDashboardLayout('u-123', [{ i: 'w', x: -1 }])).rejects.toThrow('dashboardLayout.errorValidation')
    })

    it('mapea 500 → dashboardLayout.errorServer', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(500))

      await expect(updateDashboardLayout('u-123', [])).rejects.toThrow('dashboardLayout.errorServer')
    })

    it('errores no reconocidos caen al fallback errorSave', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new Error('boom'))

      await expect(updateDashboardLayout('u-123', [])).rejects.toThrow('dashboardLayout.errorSave')
    })
  })
})
