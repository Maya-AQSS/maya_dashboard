import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../shared/components/MainLayout'

const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'))
const ApplicationsListPage = lazy(() => import('../features/applications/pages/ApplicationsListPage'))
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('../shared/pages/NotFoundPage'))

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/tools" element={<Navigate to="/applications" replace />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
