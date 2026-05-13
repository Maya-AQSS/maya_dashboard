import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getFavorites, addFavorite, removeFavorite } from './favoritesApi'

describe('favoritesApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('VITE_API_URL', 'http://maya-dashboard-api.localhost')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  // ─── getFavorites ──────────────────────────────────────────────
  describe('getFavorites', () => {
    it('devuelve array de favoritos con GET y Authorization header', async () => {
      const payload = [{ id: 1, name: 'Maya DMS' }]
      fetch.mockResolvedValue({ ok: true, json: async () => payload })

      const result = await getFavorites('u-123', 'tok-abc')

      expect(fetch).toHaveBeenCalledWith(
        'http://maya-dashboard-api.localhost/api/v1/dashboard/user/u-123/favorite-applications',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
            Authorization: 'Bearer tok-abc',
          }),
        }),
      )
      expect(result).toEqual(payload)
    })

    it('devuelve array vacío si la respuesta no es un array', async () => {
      fetch.mockResolvedValue({ ok: true, json: async () => ({ data: [] }) })

      const result = await getFavorites('u-123', 'tok-abc')

      expect(result).toEqual([])
    })

    it('falla con favorites.errorLoad si no hay userId', async () => {
      await expect(getFavorites('', 'tok-abc')).rejects.toThrow('favorites.errorLoad')
    })

    it('falla con favorites.errorLoad si no hay token', async () => {
      await expect(getFavorites('u-123', '')).rejects.toThrow('favorites.errorLoad')
    })

    it('falla con favorites.errorConfig si no hay VITE_API_URL', async () => {
      vi.stubEnv('VITE_API_URL', '')

      await expect(getFavorites('u-123', 'tok-abc')).rejects.toThrow('favorites.errorConfig')
    })

    it('falla con favorites.errorNetwork si fetch lanza', async () => {
      fetch.mockRejectedValue(new Error('network'))

      await expect(getFavorites('u-123', 'tok-abc')).rejects.toThrow('favorites.errorNetwork')
    })

    it('falla con favorites.errorUnauthorized en 401', async () => {
      fetch.mockResolvedValue({ ok: false, status: 401 })

      await expect(getFavorites('u-123', 'tok-abc')).rejects.toThrow('favorites.errorUnauthorized')
    })

    it('falla con favorites.errorForbidden en 403', async () => {
      fetch.mockResolvedValue({ ok: false, status: 403 })

      await expect(getFavorites('u-123', 'tok-abc')).rejects.toThrow('favorites.errorForbidden')
    })

    it('falla con favorites.errorServer en 500', async () => {
      fetch.mockResolvedValue({ ok: false, status: 500 })

      await expect(getFavorites('u-123', 'tok-abc')).rejects.toThrow('favorites.errorServer')
    })

    it('falla con favorites.errorLoad en otro status no-ok', async () => {
      fetch.mockResolvedValue({ ok: false, status: 422 })

      await expect(getFavorites('u-123', 'tok-abc')).rejects.toThrow('favorites.errorLoad')
    })
  })

  // ─── addFavorite ───────────────────────────────────────────────
  describe('addFavorite', () => {
    it('hace POST con body application_id y Authorization header', async () => {
      const payload = { id: 1, name: 'Maya DMS' }
      fetch.mockResolvedValue({ ok: true, json: async () => payload })

      const result = await addFavorite('u-123', 42, 'tok-abc')

      expect(fetch).toHaveBeenCalledWith(
        'http://maya-dashboard-api.localhost/api/v1/dashboard/user/u-123/favorite-applications',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer tok-abc',
          }),
          body: JSON.stringify({ application_id: 42 }),
        }),
      )
      expect(result).toEqual(payload)
    })

    it('falla con favorites.errorAdd si no hay userId', async () => {
      await expect(addFavorite('', 42, 'tok-abc')).rejects.toThrow('favorites.errorAdd')
    })

    it('falla con favorites.errorAdd si no hay applicationId', async () => {
      await expect(addFavorite('u-123', null, 'tok-abc')).rejects.toThrow('favorites.errorAdd')
    })

    it('falla con favorites.errorAdd si no hay token', async () => {
      await expect(addFavorite('u-123', 42, '')).rejects.toThrow('favorites.errorAdd')
    })

    it('falla con favorites.errorConfig si no hay VITE_API_URL', async () => {
      vi.stubEnv('VITE_API_URL', '')

      await expect(addFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorConfig')
    })

    it('falla con favorites.errorNetwork si fetch lanza', async () => {
      fetch.mockRejectedValue(new Error('network'))

      await expect(addFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorNetwork')
    })

    it('falla con favorites.errorUnauthorized en 401', async () => {
      fetch.mockResolvedValue({ ok: false, status: 401 })

      await expect(addFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorUnauthorized')
    })

    it('falla con favorites.errorServer en 500', async () => {
      fetch.mockResolvedValue({ ok: false, status: 500 })

      await expect(addFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorServer')
    })

    it('falla con favorites.errorAdd en otro status no-ok', async () => {
      fetch.mockResolvedValue({ ok: false, status: 422 })

      await expect(addFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorAdd')
    })
  })

  // ─── removeFavorite ────────────────────────────────────────────
  describe('removeFavorite', () => {
    it('hace DELETE con applicationId en la URL y Authorization header', async () => {
      fetch.mockResolvedValue({ ok: true })

      await removeFavorite('u-123', 42, 'tok-abc')

      expect(fetch).toHaveBeenCalledWith(
        'http://maya-dashboard-api.localhost/api/v1/dashboard/user/u-123/favorite-applications/42',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Accept: 'application/json',
            Authorization: 'Bearer tok-abc',
          }),
        }),
      )
    })

    it('falla con favorites.errorRemove si no hay userId', async () => {
      await expect(removeFavorite('', 42, 'tok-abc')).rejects.toThrow('favorites.errorRemove')
    })

    it('falla con favorites.errorRemove si no hay applicationId', async () => {
      await expect(removeFavorite('u-123', null, 'tok-abc')).rejects.toThrow('favorites.errorRemove')
    })

    it('falla con favorites.errorRemove si no hay token', async () => {
      await expect(removeFavorite('u-123', 42, '')).rejects.toThrow('favorites.errorRemove')
    })

    it('falla con favorites.errorConfig si no hay VITE_API_URL', async () => {
      vi.stubEnv('VITE_API_URL', '')

      await expect(removeFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorConfig')
    })

    it('falla con favorites.errorNetwork si fetch lanza', async () => {
      fetch.mockRejectedValue(new Error('network'))

      await expect(removeFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorNetwork')
    })

    it('falla con favorites.errorUnauthorized en 401', async () => {
      fetch.mockResolvedValue({ ok: false, status: 401 })

      await expect(removeFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorUnauthorized')
    })

    it('falla con favorites.errorForbidden en 403', async () => {
      fetch.mockResolvedValue({ ok: false, status: 403 })

      await expect(removeFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorForbidden')
    })

    it('falla con favorites.errorNotFound en 404', async () => {
      fetch.mockResolvedValue({ ok: false, status: 404 })

      await expect(removeFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorNotFound')
    })

    it('falla con favorites.errorServer en 500', async () => {
      fetch.mockResolvedValue({ ok: false, status: 500 })

      await expect(removeFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorServer')
    })

    it('falla con favorites.errorRemove en otro status no-ok', async () => {
      fetch.mockResolvedValue({ ok: false, status: 409 })

      await expect(removeFavorite('u-123', 42, 'tok-abc')).rejects.toThrow('favorites.errorRemove')
    })
  })
})
