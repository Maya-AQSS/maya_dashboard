import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Estos tests mockean el wrapper local `../../../api/http` (donde vive el
 * cliente real basado en `@ceedcv-maya/shared-auth-react`). La auth (Bearer
 * Keycloak) la inyecta el cliente automáticamente; el módulo
 * `favoritesApi` solo construye la URL relativa y traduce el error con
 * `mapApiError`.
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

import { addFavorite, getFavorites, removeFavorite } from './favoritesApi'
import { ApiHttpError, apiFetchJson, apiGetJson } from '../../../api/http'

describe('favoritesApi', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─── getFavorites ──────────────────────────────────────────────
  describe('getFavorites', () => {
    it('GET al endpoint /dashboard/user/{id}/favorites y devuelve array directo', async () => {
      const payload = [{ id: 1, name: 'Maya DMS' }]
      vi.mocked(apiGetJson).mockResolvedValue(payload)

      const result = await getFavorites('u-123', 'tok-abc')

      expect(apiGetJson).toHaveBeenCalledWith('/dashboard/user/u-123/favorites')
      expect(result).toEqual(payload)
    })

    it('extrae payload.data cuando la respuesta es un objeto envuelto', async () => {
      vi.mocked(apiGetJson).mockResolvedValue({ data: [{ id: 7 }] })

      const result = await getFavorites('u-123')

      expect(result).toEqual([{ id: 7 }])
    })

    it('devuelve [] si la respuesta no es array ni tiene data', async () => {
      vi.mocked(apiGetJson).mockResolvedValue({ unexpected: 'shape' })

      const result = await getFavorites('u-123')

      expect(result).toEqual([])
    })

    it('encodea userId con caracteres especiales', async () => {
      vi.mocked(apiGetJson).mockResolvedValue([])

      await getFavorites('u/with space', 'tok')

      expect(apiGetJson).toHaveBeenCalledWith('/dashboard/user/u%2Fwith%20space/favorites')
    })

    it('rechaza con favorites.errorLoad si userId vacío (no llama API)', async () => {
      await expect(getFavorites('', 'tok')).rejects.toThrow('favorites.errorLoad')
      expect(apiGetJson).not.toHaveBeenCalled()
    })

    it('mapea 401 → favorites.errorUnauthorized', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(401))

      await expect(getFavorites('u-123')).rejects.toThrow('favorites.errorUnauthorized')
    })

    it('mapea 403 → favorites.errorForbidden', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(403))

      await expect(getFavorites('u-123')).rejects.toThrow('favorites.errorForbidden')
    })

    it('mapea 500 → favorites.errorServer', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(500))

      await expect(getFavorites('u-123')).rejects.toThrow('favorites.errorServer')
    })

    it('mapea TypeError (network) → favorites.errorNetwork', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new TypeError('fetch failed'))

      await expect(getFavorites('u-123')).rejects.toThrow('favorites.errorNetwork')
    })

    it('errores sin reconocer caen al fallback favorites.errorLoad', async () => {
      vi.mocked(apiGetJson).mockRejectedValue(new Error('boom'))

      await expect(getFavorites('u-123')).rejects.toThrow('favorites.errorLoad')
    })
  })

  // ─── addFavorite ──────────────────────────────────────────────
  describe('addFavorite', () => {
    it('POST al endpoint con body { application_id }', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue({ data: { id: 42 } })

      const result = await addFavorite('u-123', 42)

      expect(apiFetchJson).toHaveBeenCalledWith(
        '/dashboard/user/u-123/favorites',
        { method: 'POST', body: { application_id: 42 } },
      )
      expect(result).toEqual({ id: 42 })
    })

    it('devuelve payload completo si no contiene .data', async () => {
      const payload = { id: 99, name: 'App' }
      vi.mocked(apiFetchJson).mockResolvedValue(payload)

      const result = await addFavorite('u-123', 99)

      expect(result).toBe(payload)
    })

    it('acepta application_id string', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue({})

      await addFavorite('u-123', 'app-slug')

      expect(apiFetchJson).toHaveBeenCalledWith(
        '/dashboard/user/u-123/favorites',
        { method: 'POST', body: { application_id: 'app-slug' } },
      )
    })

    it('rechaza con favorites.errorAdd si falta userId (no llama API)', async () => {
      await expect(addFavorite('', 42)).rejects.toThrow('favorites.errorAdd')
      expect(apiFetchJson).not.toHaveBeenCalled()
    })

    it('rechaza con favorites.errorAdd si applicationId es 0 falsy', async () => {
      // 0 es falsy → guard clause rechaza
      await expect(addFavorite('u-123', 0)).rejects.toThrow('favorites.errorAdd')
      expect(apiFetchJson).not.toHaveBeenCalled()
    })

    it('mapea 422 → favorites.errorValidation', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(422))

      await expect(addFavorite('u-123', 42)).rejects.toThrow('favorites.errorValidation')
    })

    it('mapea otros errores con fallback errorAdd', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new Error('boom'))

      await expect(addFavorite('u-123', 42)).rejects.toThrow('favorites.errorAdd')
    })
  })

  // ─── removeFavorite ──────────────────────────────────────────────
  describe('removeFavorite', () => {
    it('DELETE al endpoint con applicationId encoded en la URL', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue(undefined)

      await removeFavorite('u-123', 42)

      expect(apiFetchJson).toHaveBeenCalledWith(
        '/dashboard/user/u-123/favorites/42',
        { method: 'DELETE' },
      )
    })

    it('encodea application_id si es string con caracteres especiales', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue(undefined)

      await removeFavorite('u-123', 'app/slug')

      expect(apiFetchJson).toHaveBeenCalledWith(
        '/dashboard/user/u-123/favorites/app%2Fslug',
        { method: 'DELETE' },
      )
    })

    it('no devuelve nada (void) en éxito', async () => {
      vi.mocked(apiFetchJson).mockResolvedValue(undefined)

      const result = await removeFavorite('u-123', 42)

      expect(result).toBeUndefined()
    })

    it('rechaza con favorites.errorRemove si falta userId', async () => {
      await expect(removeFavorite('', 42)).rejects.toThrow('favorites.errorRemove')
      expect(apiFetchJson).not.toHaveBeenCalled()
    })

    it('rechaza con favorites.errorRemove si applicationId es 0', async () => {
      await expect(removeFavorite('u-123', 0)).rejects.toThrow('favorites.errorRemove')
      expect(apiFetchJson).not.toHaveBeenCalled()
    })

    it('mapea 404 → favorites.errorNotFound (regression CB-3)', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(404))

      await expect(removeFavorite('u-123', 42)).rejects.toThrow('favorites.errorNotFound')
    })

    it('mapea 500 → favorites.errorServer', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new ApiHttpError(500))

      await expect(removeFavorite('u-123', 42)).rejects.toThrow('favorites.errorServer')
    })

    it('errores sin reconocer caen al fallback errorRemove', async () => {
      vi.mocked(apiFetchJson).mockRejectedValue(new Error('boom'))

      await expect(removeFavorite('u-123', 42)).rejects.toThrow('favorites.errorRemove')
    })
  })
})
