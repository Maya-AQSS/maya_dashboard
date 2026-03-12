import { useParams, Link } from 'react-router-dom'
import useTechnologyDetail from '../hooks/useTechnologyDetail'

function TechnologyDetailPage() {
  const { id } = useParams()

  const { technology, loading, error } = useTechnologyDetail(id)

  if (loading) return <p>Cargando tecnología...</p>

  if (error) return <p>Error: {error}</p>

  if (!technology) return <p>No se ha encontrado información para esta tecnología.</p>

  return (
    <section>
      <h2>{technology.name}</h2>

      <p><strong>Categoría:</strong> {technology.category}</p>
      <p>{technology.description}</p>

      <p><strong>Versión:</strong> {technology.version}</p>
      <p><strong>Responsable:</strong> {technology.owner}</p>
      <p>
        <strong>Documentación:</strong>{' '}
        <a href={technology.documentation_url} target="_blank" rel="noreferrer">
          {technology.documentation_url}
        </a>
      </p>

      <div style={{ marginTop: '1rem' }}>
        <Link to="/technologies">← Volver al listado</Link>
      </div>
    </section>
  )
}

export default TechnologyDetailPage