import { describe, it, expect } from 'vitest'
import { sortToolsByName, sortFavoriteToolsByLastUsedAt } from './sortTools'

describe('sortToolsByName', () => {
  it('ordena por nombre con localeCompare', () => {
    const tools = [
      { name: 'Zeta', id: 1 },
      { name: 'Alpha', id: 2 },
      { name: 'Beta', id: 3 },
    ]
    const sorted = sortToolsByName(tools)
    expect(sorted.map((t) => t.name)).toEqual(['Alpha', 'Beta', 'Zeta'])
  })

  it('no muta el array original', () => {
    const tools = [{ name: 'B' }, { name: 'A' }]
    sortToolsByName(tools)
    expect(tools[0].name).toBe('B')
  })
})

describe('sortFavoriteToolsByLastUsedAt', () => {
  it('excluye no favoritas y ordena por lastUsedAt descendente', () => {
    const tools = [
      { name: 'a', isFavorite: true, lastUsedAt: '2024-01-01' },
      { name: 'b', isFavorite: false, lastUsedAt: '2025-01-01' },
      { name: 'c', isFavorite: true, lastUsedAt: '2025-06-01' },
    ]
    const sorted = sortFavoriteToolsByLastUsedAt(tools)
    expect(sorted.map((t) => t.name)).toEqual(['c', 'a'])
  })

  it('trata lastUsedAt ausente como cadena vacía', () => {
    const tools = [
      { name: 'x', isFavorite: true },
      { name: 'y', isFavorite: true, lastUsedAt: '2024-01-01' },
    ]
    const sorted = sortFavoriteToolsByLastUsedAt(tools)
    expect(sorted[0].name).toBe('y')
  })
})
