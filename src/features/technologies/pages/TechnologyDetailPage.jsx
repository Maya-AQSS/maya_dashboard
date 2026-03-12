import { useParams, Link } from 'react-router-dom'
import useTechnologyDetail from '../hooks/useTechnologyDetail'

function TechnologyDetailPage() {
  const { id } = useParams()

  const { technology, loading, error, toggleFavorite } = useTechnologyDetail(id)

  if (loading) return <p>Cargando tecnología...</p>

  if (error) return <p>Error: {error}</p>

  if (!technology) return <p>No se ha encontrado información para esta tecnología.</p>

  return (
    <>
      <section className="technology-detail">
        <header className="technology-detail-header">
          <div>
            <p className="technology-detail-category">{technology.category}</p>
            <h2 className="technology-detail-title">{technology.name}</h2>
          </div>

          <button
            type="button"
            className="technology-detail-badge"
            onClick={toggleFavorite}
          >
            {technology.is_favorite ? '★ Quitar de favoritas' : '☆ Añadir a favoritas'}
          </button>
        </header>

        <p className="technology-detail-description">{technology.description}</p>

        <dl className="technology-detail-meta">
          <div>
            <dt><strong>Versión</strong></dt>
            <dd>{technology.version}</dd>
          </div>
          <div>
            <dt><strong>Responsable</strong></dt>
            <dd>{technology.owner}</dd>
          </div>
        </dl>

        <p className="technology-detail-link">
          <strong>Documentación:</strong>{' '}
          <a href={technology.documentation_url} target="_blank" rel="noreferrer">
            {technology.documentation_url}
          </a>
        </p>
      </section>

      <div className="technology-detail-back">
        <Link to="/technologies">← Volver al listado</Link>
      </div>
    </>
  )
}

export default TechnologyDetailPage