import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToolsListFilters, PAGE_SIZE_OPTIONS } from './useToolsListFilters'

describe('useToolsListFilters', () => {
  it('inicializa con valores por defecto', () => {
    const { result } = renderHook(() => useToolsListFilters())
    expect(result.current.filters).toEqual({
      showAll: false,
      searchTerm: '',
      currentPage: 1,
      pageSize: 8,
    })
  })

  it('handleSearchChange actualiza searchTerm y resetea página', () => {
    const { result } = renderHook(() => useToolsListFilters())

    act(() => result.current.actions.setCurrentPage(3))
    act(() => result.current.actions.handleSearchChange({ target: { value: 'react' } }))

    expect(result.current.filters.searchTerm).toBe('react')
    expect(result.current.filters.currentPage).toBe(1)
  })

  it('handleClearSearch vacía searchTerm y resetea página', () => {
    const { result } = renderHook(() => useToolsListFilters())

    act(() => result.current.actions.handleSearchChange({ target: { value: 'react' } }))
    act(() => result.current.actions.setCurrentPage(2))
    act(() => result.current.actions.handleClearSearch())

    expect(result.current.filters.searchTerm).toBe('')
    expect(result.current.filters.currentPage).toBe(1)
  })

  it('handleToggleShowAll invierte showAll y resetea página', () => {
    const { result } = renderHook(() => useToolsListFilters())

    act(() => result.current.actions.setCurrentPage(5))
    act(() => result.current.actions.handleToggleShowAll())

    expect(result.current.filters.showAll).toBe(true)
    expect(result.current.filters.currentPage).toBe(1)

    act(() => result.current.actions.handleToggleShowAll())
    expect(result.current.filters.showAll).toBe(false)
  })

  it('handlePageSizeChange actualiza pageSize y resetea página', () => {
    const { result } = renderHook(() => useToolsListFilters())

    act(() => result.current.actions.setCurrentPage(4))
    act(() => result.current.actions.handlePageSizeChange(16))

    expect(result.current.filters.pageSize).toBe(16)
    expect(result.current.filters.currentPage).toBe(1)
  })

  it('resetPagination vuelve currentPage a 1', () => {
    const { result } = renderHook(() => useToolsListFilters())

    act(() => result.current.actions.setCurrentPage(7))
    act(() => result.current.actions.resetPagination())

    expect(result.current.filters.currentPage).toBe(1)
  })

  it('setCurrentPage actualiza currentPage directamente', () => {
    const { result } = renderHook(() => useToolsListFilters())

    act(() => result.current.actions.setCurrentPage(3))
    expect(result.current.filters.currentPage).toBe(3)
  })

  it('PAGE_SIZE_OPTIONS exportada contiene las opciones esperadas', () => {
    expect(PAGE_SIZE_OPTIONS).toEqual([8, 16, 24, 48])
  })
})
