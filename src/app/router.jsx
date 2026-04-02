import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import AuthLayout from '../shared/components/AuthLayout'
import MainLayout from '../shared/components/MainLayout'
import RequireAuth from './auth/RequireAuth'

const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'))
const ToolsListPage = lazy(() => import('../features/tools/pages/ToolsListPage'))
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('../shared/pages/NotFoundPage'))

function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas (layout de auth) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Rutas protegidas (RequireAuth + layout principal) */}
      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path="/tools" element={<ToolsListPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
