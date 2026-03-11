import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

function RequireAuth() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p>Cargando usuario...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RequireAuth

