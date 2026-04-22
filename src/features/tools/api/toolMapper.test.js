import { describe, it, expect } from 'vitest'
import { mapToolFromApi, mapToolToApi } from './toolMapper'

describe('toolMapper', () => {
  const apiPayload = {
    id: 't1',
    name: 'Maya DMS',
    slug: 'maya-dms',
    description: 'Sistema documental',
    traefik_url: 'http://maya_dms.localhost',
    is_favorite: true,
    updated_at: '2025-01-01',
  }

  it('mapToolFromApi convierte snake_case a camelCase del dominio', () => {
    const tool = mapToolFromApi(apiPayload)
    expect(tool).toEqual({
      id: 't1',
      name: 'Maya DMS',
      category: 'aplicacion',
      description: 'Sistema documental',
      isFavorite: true,
      documentationUrl: 'http://maya_dms.localhost',
      lastUsedAt: '2025-01-01',
    })
  })

  it('mapToolToApi es coherente con mapToolFromApi (ida y vuelta)', () => {
    const domain = mapToolFromApi(apiPayload)
    const back = mapToolToApi(domain)
    expect(back).toEqual({
      id: 't1',
      name: 'Maya DMS',
      category: 'aplicacion',
      description: 'Sistema documental',
      is_favorite: true,
      documentation_url: 'http://maya_dms.localhost',
      last_used_at: '2025-01-01',
    })
  })

  it.each([
    ['string inválido', 'no-es-una-fecha'],
    ['undefined', undefined],
    ['null', null],
  ])('mapToolFromApi convierte last_used_at %s a null', (_, value) => {
    const tool = mapToolFromApi({ ...apiPayload, updated_at: value, last_used_at: value })
    expect(tool.lastUsedAt).toBeNull()
  })

  it('usa fallback neutro cuando no llega una URL navegable', () => {
    const tool = mapToolFromApi({
      id: 't2',
      name: 'Maya Logs',
      slug: 'maya-logs',
      description: 'Auditoria',
      is_favorite: false,
    })

    expect(tool.documentationUrl).toBe('#')
  })
})
