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

  const visibleTools = useMemo(() => {

    if (!tools || tools.length === 0) return []

    if (showAll) {
      return sortToolsByName(tools)
    }

    return sortFavoriteToolsByLastUsedAt(tools)

  }, [tools, showAll])

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

      <ToolsGrid
        tools={visibleTools}
        onToggleFavorite={toggleFavorite}
        showLastUsed={showLastUsed}
      />

    </>
  )
}

export default ToolsListPage