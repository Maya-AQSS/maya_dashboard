import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDashboardLayout, updateDashboardLayout } from './dashboardLayoutApi'

describe('dashboardLayoutApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('VITE_API_URL', 'http://maya-dashboard-api.localhost')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  // ─── getDashboardLayout ────────────────────────────────────────
  describe('getDashboardLayout', () => {
    it('hace GET y devuelve payload de layout', async () => {
      const payload = { layout: { cols: 3 }, updated_at: '2024-01-01T00:00:00Z' }
      fetch.mockResolvedValue({ ok: true, json: async () => payload })

      const result = await getDashboardLayout('u-123', 'tok-abc')

      expect(fetch).toHaveBeenCalledWith(
        'http://maya-dashboard-api.localhost/api/v1/dashboard/user/u-123/dashboard-layout',
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

    it('falla con dashboardLayout.errorLoad si no hay userId', async () => {
      await expect(getDashboardLayout('', 'tok-abc')).rejects.toThrow('dashboardLayout.errorLoad')
    })

    it('falla con dashboardLayout.errorLoad si no hay token', async () => {
      await expect(getDashboardLayout('u-123', '')).rejects.toThrow('dashboardLayout.errorLoad')
    })

    it('falla con dashboardLayout.errorConfig si no hay VITE_API_URL', async () => {
      vi.stubEnv('VITE_API_URL', '')

      await expect(getDashboardLayout('u-123', 'tok-abc')).rejects.toThrow('dashboardLayout.errorConfig')
    })

    it('falla con dashboardLayout.errorNetwork si fetch lanza', async () => {
      fetch.mockRejectedValue(new Error('network'))

      await expect(getDashboardLayout('u-123', 'tok-abc')).rejects.toThrow('dashboardLayout.errorNetwork')
    })

    it('falla con dashboardLayout.errorUnauthorized en 401', async () => {
      fetch.mockResolvedValue({ ok: false, status: 401 })

      await expect(getDashboardLayout('u-123', 'tok-abc')).rejects.toThrow('dashboardLayout.errorUnauthorized')
    })

    it('falla con dashboardLayout.errorForbidden en 403', async () => {
      fetch.mockResolvedValue({ ok: false, status: 403 })

      await expect(getDashboardLayout('u-123', 'tok-abc')).rejects.toThrow('dashboardLayout.errorForbidden')
    })

    it('falla con dashboardLayout.errorServer en 500', async () => {
      fetch.mockResolvedValue({ ok: false, status: 500 })

      await expect(getDashboardLayout('u-123', 'tok-abc')).rejects.toThrow('dashboardLayout.errorServer')
    })

    it('falla con dashboardLayout.errorLoad en otro status no-ok', async () => {
      fetch.mockResolvedValue({ ok: false, status: 404 })

      await expect(getDashboardLayout('u-123', 'tok-abc')).rejects.toThrow('dashboardLayout.errorLoad')
    })
  })

  // ─── updateDashboardLayout ─────────────────────────────────────
  describe('updateDashboardLayout', () => {
    it('hace PUT con body layout y Authorization header', async () => {
      const layout = { cols: 3, rows: 2 }
      const payload = { layout, updated_at: '2024-01-01T00:00:00Z' }
      fetch.mockResolvedValue({ ok: true, json: async () => payload })

      const result = await updateDashboardLayout('u-123', layout, 'tok-abc')

      expect(fetch).toHaveBeenCalledWith(
        'http://maya-dashboard-api.localhost/api/v1/dashboard/user/u-123/dashboard-layout',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer tok-abc',
          }),
          body: JSON.stringify({ layout }),
        }),
      )
      expect(result).toEqual(payload)
    })

    it('falla con dashboardLayout.errorSave si no hay userId', async () => {
      await expect(updateDashboardLayout('', {}, 'tok-abc')).rejects.toThrow('dashboardLayout.errorSave')
    })

    it('falla con dashboardLayout.errorSave si no hay token', async () => {
      await expect(updateDashboardLayout('u-123', {}, '')).rejects.toThrow('dashboardLayout.errorSave')
    })

    it('falla con dashboardLayout.errorConfig si no hay VITE_API_URL', async () => {
      vi.stubEnv('VITE_API_URL', '')

      await expect(updateDashboardLayout('u-123', {}, 'tok-abc')).rejects.toThrow('dashboardLayout.errorConfig')
    })

    it('falla con dashboardLayout.errorNetwork si fetch lanza', async () => {
      fetch.mockRejectedValue(new Error('network'))

      await expect(updateDashboardLayout('u-123', {}, 'tok-abc')).rejects.toThrow('dashboardLayout.errorNetwork')
    })

    it('falla con dashboardLayout.errorUnauthorized en 401', async () => {
      fetch.mockResolvedValue({ ok: false, status: 401 })

      await expect(updateDashboardLayout('u-123', {}, 'tok-abc')).rejects.toThrow('dashboardLayout.errorUnauthorized')
    })

    it('falla con dashboardLayout.errorForbidden en 403', async () => {
      fetch.mockResolvedValue({ ok: false, status: 403 })

      await expect(updateDashboardLayout('u-123', {}, 'tok-abc')).rejects.toThrow('dashboardLayout.errorForbidden')
    })

    it('falla con dashboardLayout.errorValidation en 422', async () => {
      fetch.mockResolvedValue({ ok: false, status: 422 })

      await expect(updateDashboardLayout('u-123', {}, 'tok-abc')).rejects.toThrow('dashboardLayout.errorValidation')
    })

    it('falla con dashboardLayout.errorServer en 500', async () => {
      fetch.mockResolvedValue({ ok: false, status: 500 })

      await expect(updateDashboardLayout('u-123', {}, 'tok-abc')).rejects.toThrow('dashboardLayout.errorServer')
    })

    it('falla con dashboardLayout.errorSave en otro status no-ok', async () => {
      fetch.mockResolvedValue({ ok: false, status: 409 })

      await expect(updateDashboardLayout('u-123', {}, 'tok-abc')).rejects.toThrow('dashboardLayout.errorSave')
    })
  })
})
