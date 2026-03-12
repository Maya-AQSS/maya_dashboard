import { useMemo, useState } from 'react'
import useToolsData from '../hooks/useToolsData'
import ToolsGrid from '../components/ToolsGrid'
import ToolsToggleButton from '../components/ToolsToggleButton'
import PageHeader from '../../../shared/components/PageHeader'
import { sortToolsByName, sortFavoriteToolsByLastUsedAt } from '../lib/sortTools'
import '../styles/tools.css'

function ToolsListPage() {

  const { tools, loading, error, toggleFavorite } = useToolsData()
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const visibleTools = useMemo(() => {
    if (!tools || tools.length === 0) return []

    const normalizedSearch = searchTerm.trim().toLowerCase()

    const baseList = showAll ? tools : tools.filter((tool) => tool.isFavorite)

    const filtered = !normalizedSearch
      ? baseList
      : baseList.filter((tool) =>
        [
          tool.name,
          tool.category,
          tool.description,
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(normalizedSearch))
      )

    return showAll
      ? sortToolsByName(filtered)
      : sortFavoriteToolsByLastUsedAt(filtered)

  }, [tools, showAll, searchTerm])

  const showLastUsed = !showAll

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
        tools={visibleTools}
        onToggleFavorite={toggleFavorite}
        showLastUsed={showLastUsed}
      />

    </>
  )
}

export default ToolsListPage