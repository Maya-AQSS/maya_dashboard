import useDashboardData from '../hooks/useDashboardData'
import DashboardCards from '../components/DashboardCards'

function DashboardPage() {

  const { applications, loading, error } = useDashboardData()

  if (loading) return <div>Cargando...</div>

  if (error) return <div>Error: {error}</div>

  return (
    <>
      <h2>Dashboard de Tecnologías y Herramientas</h2>
      <p>Resumen de tecnologías y herramientas disponibles.</p>
      
      <DashboardCards applications={applications} />
    </>
  )
}

export default DashboardPage