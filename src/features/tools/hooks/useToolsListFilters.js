import { useState, useCallback, useMemo } from 'react'

export const PAGE_SIZE_OPTIONS = [8, 16, 24, 48]
const DEFAULT_PAGE_SIZE = 8

/**
 * Gestiona el estado de filtros y paginación del listado de herramientas.
 * Centraliza showAll, searchTerm, currentPage y pageSize con sus handlers,
 * garantizando que cualquier cambio de filtro resetea la página a 1.
 *
 * @returns {{
 *   filters: { showAll: boolean, searchTerm: string, currentPage: number, pageSize: number },
 *   actions: {
 *     handleSearchChange: (event: Event) => void,
 *     handleClearSearch: () => void,
 *     handleToggleShowAll: () => void,
 *     handlePageSizeChange: (nextSize: number) => void,
 *     setCurrentPage: (page: number | ((prev: number) => number)) => void,
 *     resetPagination: () => void,
 *   }
 * }}
 */
function useToolsListFilters() {
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const resetPagination = useCallback(() => setCurrentPage(1), [])

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
    setCurrentPage(1)
  }, [])

  const handleToggleShowAll = useCallback(() => {
    setShowAll((prev) => !prev)
    setCurrentPage(1)
  }, [])

  const handlePageSizeChange = useCallback((nextSize) => {
    setPageSize(nextSize)
    setCurrentPage(1)
  }, [])

  const filters = useMemo(
    () => ({ showAll, searchTerm, currentPage, pageSize }),
    [showAll, searchTerm, currentPage, pageSize],
  )

  const actions = useMemo(
    () => ({
      handleSearchChange,
      handleClearSearch,
      handleToggleShowAll,
      handlePageSizeChange,
      setCurrentPage,
      resetPagination,
    }),
    [handleSearchChange, handleClearSearch, handleToggleShowAll, handlePageSizeChange, resetPagination],
  )

  return useMemo(() => ({ filters, actions }), [filters, actions])
}

export { useToolsListFilters }
