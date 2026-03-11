import useDashboardData from '../hooks/useDashboardData'
import DashboardCards from '../components/DashboardCards'
import '../styles/dashboard.css'

function DashboardPage() {
  const { applications, loading, error } = useDashboardData()

  if (loading) return <div>Cargando...</div>

  if (error) return <div>Error: {error}</div>

  if (!applications || applications.length === 0) {
    return <p>No hay aplicaciones para mostrar.</p>
  }

  return (
    <>
      <section className="dashboard-header">
        <h2>Dashboard de Tecnologías y Herramientas</h2>
        <p>Resumen de tecnologías y herramientas que están disponibles en el sistema.</p>
      </section>

      <DashboardCards applications={applications} />
    </>
  )
}

export default DashboardPage