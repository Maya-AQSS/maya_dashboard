import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getToolsData } from './toolsApi'

const originalEnv = import.meta.env

describe('toolsApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubEnv('VITE_API_URL', 'http://maya_authorization_api.localhost')
    vi.stubEnv('VITE_APP_KEY', 'test-app-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('consulta apps accesibles con X-App-Key y mapea respuesta', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: 10,
            name: 'Maya DMS',
            slug: 'maya-dms',
            description: 'Sistema documental',
            traefik_url: 'http://maya_dms.localhost',
          },
        ],
      }),
    })

    const response = await getToolsData('u-123')

    expect(fetch).toHaveBeenCalledWith(
      'http://maya_authorization_api.localhost/api/v1/auth/user/u-123/apps',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-App-Key': 'test-app-key',
        },
      }),
    )

    expect(response.tools).toHaveLength(1)
    expect(response.tools[0].documentationUrl).toBe('http://maya_dms.localhost')
  })

  it('falla si no hay app key configurada', async () => {
    vi.stubEnv('VITE_APP_KEY', '')

    await expect(getToolsData('u-123')).rejects.toThrow('tools.errorLoad')
  })
})
