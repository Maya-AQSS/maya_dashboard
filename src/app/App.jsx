import DashboardPage from '../features/dashboard/pages/DashboardPage'
import { useAuth } from '@maya/shared-auth-react'

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando autenticación...
      </div>
    )
  }

  return <DashboardPage />
}

export default App
