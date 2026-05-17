import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock oidcAdapter BEFORE importing http so createApiClient never runs
vi.mock('../auth/oidcAdapter', () => ({
  oidcAuthService: {
    keycloak: {},
  },
}))

// Mock createApiClient so it returns a stub — we only test mapApiError here
vi.mock('@maya/shared-auth-react', () => {
  class ApiHttpError extends Error {
    status: number
    constructor(status: number, message = '') {
      super(message)
      this.status = status
    }
  }

  return {
    ApiHttpError,
    createApiClient: vi.fn(() => ({
      apiFetchJson: vi.fn(),
      apiGetJson: vi.fn(),
      buildApiUrl: vi.fn(),
      getBearerToken: vi.fn(),
    })),
  }
})

import { mapApiError, ApiHttpError } from './http'

describe('mapApiError', () => {
  describe('ApiHttpError status codes', () => {
    it('mapea 401 a <prefix>.errorUnauthorized', () => {
      const err = new ApiHttpError(401)
      expect(mapApiError(err, 'favorites').message).toBe('favorites.errorUnauthorized')
    })

    it('mapea 403 a <prefix>.errorForbidden', () => {
      const err = new ApiHttpError(403)
      expect(mapApiError(err, 'favorites').message).toBe('favorites.errorForbidden')
    })

    it('mapea 404 a <prefix>.errorNotFound', () => {
      const err = new ApiHttpError(404)
      expect(mapApiError(err, 'dashboardLayout').message).toBe('dashboardLayout.errorNotFound')
    })

    it('mapea 422 a <prefix>.errorValidation', () => {
      const err = new ApiHttpError(422)
      expect(mapApiError(err, 'profile').message).toBe('profile.errorValidation')
    })

    it('mapea 500 a <prefix>.errorServer', () => {
      const err = new ApiHttpError(500)
      expect(mapApiError(err, 'alerts').message).toBe('alerts.errorServer')
    })

    it('mapea 503 (>=500) a <prefix>.errorServer', () => {
      const err = new ApiHttpError(503)
      expect(mapApiError(err, 'alerts').message).toBe('alerts.errorServer')
    })
  })

  describe('TypeError (network failure)', () => {
    it('mapea TypeError a <prefix>.errorNetwork', () => {
      const err = new TypeError('Failed to fetch')
      expect(mapApiError(err, 'applications').message).toBe('applications.errorNetwork')
    })
  })

  describe('fallback', () => {
    it('mapea error desconocido al fallbackSuffix por defecto (errorLoad)', () => {
      const err = new Error('unknown')
      expect(mapApiError(err, 'favorites').message).toBe('favorites.errorLoad')
    })

    it('usa el fallbackSuffix personalizado cuando se pasa', () => {
      const err = new Error('unknown')
      expect(mapApiError(err, 'favorites', 'errorCustom').message).toBe('favorites.errorCustom')
    })

    it('mapea string lanzado (no-Error) al fallbackSuffix', () => {
      expect(mapApiError('algo', 'test').message).toBe('test.errorLoad')
    })

    it('mapea null al fallbackSuffix', () => {
      expect(mapApiError(null, 'test').message).toBe('test.errorLoad')
    })
  })

  describe('retorno siempre es Error', () => {
    it('devuelve una instancia de Error en todos los casos', () => {
      expect(mapApiError(new ApiHttpError(401), 'x')).toBeInstanceOf(Error)
      expect(mapApiError(new TypeError('net'), 'x')).toBeInstanceOf(Error)
      expect(mapApiError({}, 'x')).toBeInstanceOf(Error)
    })
  })
})
