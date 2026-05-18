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

import { getApplicationsData } from './applicationsApi'
import { ApiHttpError, apiGetJson } from '../../../api/http'

describe('getApplicationsData', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('lanza applications.errorLoad cuando userId está vacío', async () => {
    await expect(getApplicationsData('')).rejects.toThrow('applications.errorLoad')
    expect(vi.mocked(apiGetJson)).not.toHaveBeenCalled()
  })

  it('llama al endpoint correcto con userId codificado', async () => {
    vi.mocked(apiGetJson).mockResolvedValue({ data: [] })

    await getApplicationsData('user-123')

    expect(vi.mocked(apiGetJson)).toHaveBeenCalledWith('/dashboard/user/user-123/applications')
  })

  it('codifica userId con caracteres especiales en la URL', async () => {
    vi.mocked(apiGetJson).mockResolvedValue({ data: [] })

    await getApplicationsData('user@domain.com')

    expect(vi.mocked(apiGetJson)).toHaveBeenCalledWith(
      '/dashboard/user/user%40domain.com/applications',
    )
  })

  it('mapea las aplicaciones del payload correctamente', async () => {
    const rawApps = [
      { id: 1, name: 'App A', category: 'herramienta', is_favorite: true, traefik_url: 'https://app-a.test' },
    ]
    vi.mocked(apiGetJson).mockResolvedValue({ data: rawApps })

    const result = await getApplicationsData('user-1')

    expect(result.applications).toHaveLength(1)
    expect(result.applications[0].name).toBe('App A')
    expect(result.applications[0].isFavorite).toBe(true)
  })

  it('retorna applications vacío cuando data no es array', async () => {
    vi.mocked(apiGetJson).mockResolvedValue({ data: null })

    const result = await getApplicationsData('user-1')

    expect(result.applications).toEqual([])
  })

  it('retorna applications vacío cuando data es undefined en el payload', async () => {
    vi.mocked(apiGetJson).mockResolvedValue({})

    const result = await getApplicationsData('user-1')

    expect(result.applications).toEqual([])
  })

  it('mapea 401 → applications.errorUnauthorized', async () => {
    vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(401))

    await expect(getApplicationsData('user-1')).rejects.toThrow('applications.errorUnauthorized')
  })

  it('mapea 403 → applications.errorForbidden', async () => {
    vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(403))

    await expect(getApplicationsData('user-1')).rejects.toThrow('applications.errorForbidden')
  })

  it('mapea 404 → applications.errorNotFound', async () => {
    vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(404))

    await expect(getApplicationsData('user-1')).rejects.toThrow('applications.errorNotFound')
  })

  it('mapea 500 → applications.errorServer', async () => {
    vi.mocked(apiGetJson).mockRejectedValue(new ApiHttpError(500))

    await expect(getApplicationsData('user-1')).rejects.toThrow('applications.errorServer')
  })

  it('mapea TypeError → applications.errorNetwork', async () => {
    vi.mocked(apiGetJson).mockRejectedValue(new TypeError('fetch failed'))

    await expect(getApplicationsData('user-1')).rejects.toThrow('applications.errorNetwork')
  })

  it('errores sin reconocer caen al fallback applications.errorLoad', async () => {
    vi.mocked(apiGetJson).mockRejectedValue(new Error('boom'))

    await expect(getApplicationsData('user-1')).rejects.toThrow('applications.errorLoad')
  })
})
