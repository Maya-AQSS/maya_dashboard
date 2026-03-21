import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth.js'

function RequireAuth() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default RequireAuth

