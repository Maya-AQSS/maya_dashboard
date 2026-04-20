import { describe, it, expect } from 'vitest'
import { mapToolFromApi, mapToolToApi } from './toolMapper'

describe('toolMapper', () => {
  const apiPayload = {
    id: 't1',
    name: 'Editor',
    category: 'dev',
    description: 'Desc',
    is_favorite: true,
    documentation_url: 'https://example.com',
    last_used_at: '2025-01-01',
  }

  it('mapToolFromApi convierte snake_case a camelCase del dominio', () => {
    const tool = mapToolFromApi(apiPayload)
    expect(tool).toEqual({
      id: 't1',
      name: 'Editor',
      category: 'dev',
      description: 'Desc',
      isFavorite: true,
      documentationUrl: 'https://example.com',
      lastUsedAt: '2025-01-01',
    })
  })

  it('mapToolToApi es coherente con mapToolFromApi (ida y vuelta)', () => {
    const domain = mapToolFromApi(apiPayload)
    const back = mapToolToApi(domain)
    expect(back).toEqual(apiPayload)
  })

  it.each([
    ['string inválido', 'no-es-una-fecha'],
    ['undefined', undefined],
    ['null', null],
  ])('mapToolFromApi convierte last_used_at %s a null', (_, value) => {
    const tool = mapToolFromApi({ ...apiPayload, last_used_at: value })
    expect(tool.lastUsedAt).toBeNull()
  })
})
