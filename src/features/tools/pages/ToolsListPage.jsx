import useToolsData from '../hooks/useToolsData'
import ToolsGrid from '../components/ToolsGrid'
import '../styles/tools.css'

function ToolsListPage() {

  const { tools, loading, error, toggleFavorite } = useToolsData()

  if (loading) return <div>Cargando...</div>

  if (error) return <div>Error: {error}</div>

  if (!tools || tools.length === 0) {
    return <p>No hay herramientas para mostrar.</p>
  }

  const favoriteTools = tools.filter((tool) => tool.is_favorite)
  const otherTools = tools.filter((tool) => !tool.is_favorite)

  return (
    <>
      <section className="tools-header">
        <h2>Listado de Herramientas</h2>
        <p>Herramientas que están disponibles en el sistema.</p>
      </section>

      {favoriteTools.length > 0 && (
        <section>
          <h3>Favoritas</h3>
          <ToolsGrid tools={favoriteTools} onToggleFavorite={toggleFavorite} />
        </section>
      )}

      {otherTools.length > 0 && (
        <section>
          <h3>Otras herramientas</h3>
          <ToolsGrid tools={otherTools} onToggleFavorite={toggleFavorite} />
        </section>
      )}
    </>
  )
}

export default ToolsListPage