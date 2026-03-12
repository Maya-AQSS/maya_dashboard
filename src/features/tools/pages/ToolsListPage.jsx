import { useState } from 'react'
import useToolsData from '../hooks/useToolsData'
import ToolsGrid from '../components/ToolsGrid'
import ToolsToggleButton from '../components/ToolsToggleButton'
import PageHeader from '../../../shared/components/PageHeader'
import '../styles/tools.css'

function ToolsListPage() {

  const { tools, loading, error, toggleFavorite } = useToolsData()
  const [showAll, setShowAll] = useState(false)

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>
  if (!tools || tools.length === 0) return <p>No hay herramientas para mostrar.</p>

  const favoriteTools = tools.filter((tool) => tool.is_favorite)

  return (
    <>
      <PageHeader
        title={showAll ? 'Todas las herramientas' : 'Herramientas favoritas'}
        subtitle={showAll ? "Herramientas que están disponibles en el sistema." : "Tus herramientas favoritas."}
        rightAction={
          <ToolsToggleButton
            showAll={showAll}
            onToggle={() => setShowAll((prev) => !prev)}
          />
        }
      />

      {showAll ? (
        <ToolsGrid tools={tools} onToggleFavorite={toggleFavorite} />
      ) : (
        <ToolsGrid tools={favoriteTools} onToggleFavorite={toggleFavorite} />
      )}
    </>
  )
}

export default ToolsListPage