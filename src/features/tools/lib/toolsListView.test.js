import { describe, it, expect } from 'vitest'
import { buildVisibleTools, paginate, getPageNumbersToDisplay } from './toolsListView'

const sampleTools = [
  {
    id: '1',
    name: 'Editor',
    category: 'dev',
    description: 'Código fuente',
    isFavorite: true,
    lastUsedAt: '2025-01-01',
  },
  {
    id: '2',
    name: 'Monitor',
    category: 'ops',
    description: 'Métricas en vivo',
    isFavorite: false,
    lastUsedAt: '2024-12-01',
  },
  {
    id: '3',
    name: 'Wiki',
    category: 'docs',
    description: 'Documentación interna',
    isFavorite: true,
    lastUsedAt: '2025-02-01',
  },
]

describe('buildVisibleTools', () => {
  it('devuelve array vacío sin herramientas', () => {
    expect(buildVisibleTools(null, { showAll: true, searchTerm: '' })).toEqual([])
    expect(buildVisibleTools([], { showAll: true, searchTerm: '' })).toEqual([])
  })

  it('con showAll lista todas ordenadas por nombre', () => {
    const result = buildVisibleTools(sampleTools, { showAll: true, searchTerm: '' })
    expect(result.map((t) => t.name)).toEqual(['Editor', 'Monitor', 'Wiki'])
  })

  it('con showAll false solo favoritas ordenadas por último uso', () => {
    const result = buildVisibleTools(sampleTools, { showAll: false, searchTerm: '' })
    expect(result.map((t) => t.name)).toEqual(['Wiki', 'Editor'])
  })

  it('filtra por término en nombre, categoría o descripción (case insensitive)', () => {
    const r1 = buildVisibleTools(sampleTools, { showAll: true, searchTerm: 'MONITOR' })
    expect(r1).toHaveLength(1)
    expect(r1[0].name).toBe('Monitor')

    const r2 = buildVisibleTools(sampleTools, { showAll: true, searchTerm: 'docs' })
    expect(r2.map((t) => t.name)).toEqual(['Wiki'])

    const r3 = buildVisibleTools(sampleTools, { showAll: true, searchTerm: 'vivo' })
    expect(r3.map((t) => t.name)).toEqual(['Monitor'])
  })

  it('ignora espacios en blanco del término de búsqueda', () => {
    const result = buildVisibleTools(sampleTools, { showAll: true, searchTerm: '  wiki  ' })
    expect(result).toHaveLength(1)
  })
})

describe('paginate', () => {
  it('con lista vacía devuelve una página y sin items', () => {
    const { pageItems, meta } = paginate([], { pageSize: 5, currentPage: 1 })
    expect(pageItems).toEqual([])
    expect(meta.totalPages).toBe(1)
    expect(meta.totalItems).toBe(0)
    expect(meta.currentPage).toBe(1)
  })

  it('pagina y recorta currentPage a rango válido', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const high = paginate(items, { pageSize: 3, currentPage: 99 })
    expect(high.meta.currentPage).toBe(4)
    expect(high.pageItems).toEqual([10])

    const low = paginate(items, { pageSize: 3, currentPage: 0 })
    expect(low.meta.currentPage).toBe(1)
  })

  it('expone canGoPrev y canGoNext', () => {
    const items = [1, 2, 3, 4]
    const p1 = paginate(items, { pageSize: 2, currentPage: 1 })
    expect(p1.meta.canGoPrev).toBe(false)
    expect(p1.meta.canGoNext).toBe(true)

    const p2 = paginate(items, { pageSize: 2, currentPage: 2 })
    expect(p2.meta.canGoPrev).toBe(true)
    expect(p2.meta.canGoNext).toBe(false)
  })
})

describe('getPageNumbersToDisplay', () => {
  it('con pocas páginas devuelve todos los números', () => {
    expect(getPageNumbersToDisplay(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('con muchas páginas incluye ellipsis', () => {
    const result = getPageNumbersToDisplay(5, 20)
    expect(result).toContain(1)
    expect(result).toContain(20)
    expect(result).toContain(5)
    expect(result).toContain('ellipsis')
  })

  it('incluye primera y última página', () => {
    const result = getPageNumbersToDisplay(10, 15)
    expect(result[0]).toBe(1)
    expect(result[result.length - 1]).toBe(15)
  })
})
