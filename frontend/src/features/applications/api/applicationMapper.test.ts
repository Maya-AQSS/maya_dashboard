import { describe, expect, it } from 'vitest'
import { mapApplicationFromApi, mapApplicationToApi } from './applicationMapper'

describe('mapApplicationFromApi', () => {
  it('mapea los campos básicos correctamente', () => {
    const app = {
      id: 1,
      name: 'Mi App',
      category: 'herramienta',
      description: 'Descripción',
      is_favorite: true,
      traefik_url: 'https://app.maya.test',
      last_used_at: '2026-05-01T10:00:00Z',
    }

    const result = mapApplicationFromApi(app)

    expect(result.id).toBe(1)
    expect(result.name).toBe('Mi App')
    expect(result.category).toBe('herramienta')
    expect(result.description).toBe('Descripción')
    expect(result.isFavorite).toBe(true)
    expect(result.documentationUrl).toBe('https://app.maya.test')
    expect(result.lastUsedAt).toBe('2026-05-01T10:00:00Z')
  })

  it('usa category "aplicacion" cuando category no está presente', () => {
    const result = mapApplicationFromApi({ id: 2, name: 'App sin cat' })
    expect(result.category).toBe('aplicacion')
  })

  it('usa documentation_url cuando traefik_url no está presente', () => {
    const result = mapApplicationFromApi({
      id: 3,
      name: 'App',
      documentation_url: 'https://docs.example.com',
    })
    expect(result.documentationUrl).toBe('https://docs.example.com')
  })

  it('usa "#" como URL por defecto cuando ninguna URL está presente', () => {
    const result = mapApplicationFromApi({ id: 4, name: 'App sin url' })
    expect(result.documentationUrl).toBe('#')
  })

  it('usa updated_at cuando last_used_at no está presente', () => {
    const result = mapApplicationFromApi({
      id: 5,
      name: 'App',
      updated_at: '2026-04-15T08:00:00Z',
    })
    expect(result.lastUsedAt).toBe('2026-04-15T08:00:00Z')
  })

  it('convierte is_favorite a boolean (truthy → true)', () => {
    const result = mapApplicationFromApi({ id: 6, name: 'App', is_favorite: 1 })
    expect(result.isFavorite).toBe(true)
  })

  it('convierte is_favorite a boolean (falsy → false)', () => {
    const result = mapApplicationFromApi({ id: 7, name: 'App', is_favorite: 0 })
    expect(result.isFavorite).toBe(false)
  })

  it('retorna lastUsedAt null cuando la fecha es inválida', () => {
    const result = mapApplicationFromApi({
      id: 8,
      name: 'App',
      last_used_at: 'not-a-date',
    })
    expect(result.lastUsedAt).toBeNull()
  })

  it('retorna lastUsedAt null cuando last_used_at es null', () => {
    const result = mapApplicationFromApi({ id: 9, name: 'App', last_used_at: null })
    expect(result.lastUsedAt).toBeNull()
  })

  it('retorna lastUsedAt null cuando last_used_at es undefined y updated_at es undefined', () => {
    const result = mapApplicationFromApi({ id: 10, name: 'App' })
    expect(result.lastUsedAt).toBeNull()
  })
})

describe('mapApplicationToApi', () => {
  it('mapea todos los campos a la convención snake_case', () => {
    const app = {
      id: 42,
      name: 'Herramienta',
      category: 'herramienta',
      description: 'Desc',
      isFavorite: true,
      documentationUrl: 'https://example.com',
      lastUsedAt: '2026-05-01T10:00:00Z',
    }

    const result = mapApplicationToApi(app)

    expect(result.id).toBe(42)
    expect(result.name).toBe('Herramienta')
    expect(result.category).toBe('herramienta')
    expect(result.description).toBe('Desc')
    expect(result.is_favorite).toBe(true)
    expect(result.documentation_url).toBe('https://example.com')
    expect(result.last_used_at).toBe('2026-05-01T10:00:00Z')
  })

  it('no añade propiedades extras', () => {
    const result = mapApplicationToApi({ id: 1, name: 'App', isFavorite: false })
    const keys = Object.keys(result)
    expect(keys).toContain('is_favorite')
    expect(keys).not.toContain('isFavorite')
  })
})
