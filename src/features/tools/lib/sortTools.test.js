import { describe, it, expect } from 'vitest'
import { sortToolsByName, sortByLastUsedAtDesc } from './sortTools'

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

describe('sortByLastUsedAtDesc', () => {
  it('ordena por lastUsedAt descendente', () => {
    const tools = [
      { name: 'a', lastUsedAt: '2024-01-01' },
      { name: 'b', lastUsedAt: '2025-06-01' },
      { name: 'c', lastUsedAt: '2025-01-01' },
    ]
    const sorted = sortByLastUsedAtDesc(tools)
    expect(sorted.map((t) => t.name)).toEqual(['b', 'c', 'a'])
  })

  it('trata lastUsedAt ausente como cadena vacía (va al final)', () => {
    const tools = [
      { name: 'x' },
      { name: 'y', lastUsedAt: '2024-01-01' },
    ]
    const sorted = sortByLastUsedAtDesc(tools)
    expect(sorted[0].name).toBe('y')
  })

  it('no muta el array original', () => {
    const tools = [
      { name: 'B', lastUsedAt: '2025-01-01' },
      { name: 'A', lastUsedAt: '2026-01-01' },
    ]
    sortByLastUsedAtDesc(tools)
    expect(tools[0].name).toBe('B')
  })
})
