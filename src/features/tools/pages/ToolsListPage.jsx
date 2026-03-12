import { useEffect, useMemo, useState } from 'react'
import useToolsData from '../hooks/useToolsData'
import ToolsGrid from '../components/ToolsGrid'
import ToolsToggleButton from '../components/ToolsToggleButton'
import PageHeader from '../../../shared/components/PageHeader'
import { buildVisibleTools, paginate } from '../lib/toolsListView'
import '../styles/tools.css'


const PAGE_SIZE = 8

function ToolsListPage() {

  const { tools, loading, error, toggleFavorite } = useToolsData()
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)


  useEffect(() => {
    setCurrentPage(1)
  }, [showAll, searchTerm])


  const { pageItems, meta } = useMemo(() => {

    const visible = buildVisibleTools(tools, { showAll, searchTerm })
    return paginate(visible, { pageSize: PAGE_SIZE, currentPage })

  }, [tools, showAll, searchTerm, currentPage])

  const { totalItems, totalPages, startIndex, endIndex, canGoPrev, canGoNext } = meta
  
  const showLastUsed = !showAll

  const handlePrevPage = () => {
    if (canGoPrev) setCurrentPage((page) => page - 1)
  }

  const handleNextPage = () => {
    if (canGoNext) setCurrentPage((page) => page + 1)
  }

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>
  if (!tools || tools.length === 0) return <p>No hay herramientas para mostrar.</p>


  return (
    <>
      <PageHeader
        title={showAll ? 'Todas las herramientas' : 'Herramientas favoritas'}
        subtitle={
          showAll
            ? 'Herramientas que están disponibles en el sistema.'
            : 'Tus herramientas favoritas.'
        }
        rightAction={
          <ToolsToggleButton
            showAll={showAll}
            onToggle={() => setShowAll((prev) => !prev)}
          />
        }
      />


      <div className="tools-search">
        <div className="tools-search-box">
          <input
            type="text"
            className="tools-search-input"
            placeholder="Buscar por nombre, categoría o descripción"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="tools-search-clear"
              onClick={() => setSearchTerm('')}
              aria-label="Borrar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>


      <ToolsGrid
        tools={pageItems}
        onToggleFavorite={toggleFavorite}
        showLastUsed={showLastUsed}
      />


      {totalItems > PAGE_SIZE && (
        <div className="tools-pagination">
          <button
            type="button"
            className="tools-pagination-button tools-pagination-button-secondary"
            onClick={handlePrevPage}
            disabled={!canGoPrev}
          >
            Anterior
          </button>

          <span className="tools-pagination-info">
            Mostrando {startIndex + 1}–{Math.min(endIndex, totalItems)} de {totalItems}{' '}
            herramientas · Página {currentPage} de {totalPages}
          </span>

          <button
            type="button"
            className="tools-pagination-button"
            onClick={handleNextPage}
            disabled={!canGoNext}
          >
            Siguiente
          </button>
        </div>
      )}

    </>
  )
}

export default ToolsListPage