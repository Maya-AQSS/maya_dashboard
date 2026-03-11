import useTechnologiesData from '../hooks/useTechnologiesData'
import TechnologiesGrid from '../components/TechnologiesGrid'
import '../styles/technologies.css'

function TechnologiesListPage() {

  const { technologies, loading, error } = useTechnologiesData()

  if (loading) return <div>Cargando...</div>

  if (error) return <div>Error: {error}</div>

  if (!technologies || technologies.length === 0) {
    return <p>No hay tecnologías para mostrar.</p>
  }

  return (
    <>
      <section className="technologies-header">
        <h2>Listado de Tecnologías y Herramientas</h2>
        <p>Tecnologías y herramientas que están disponibles en el sistema.</p>
      </section>

      <TechnologiesGrid technologies={technologies} />
    </>
  )
}

export default TechnologiesListPage