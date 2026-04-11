import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from '../shared/components/MainLayout'

const ToolsListPage = lazy(() => import('../features/tools/pages/ToolsListPage'))
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'))
const NotFoundPage = lazy(() => import('../shared/pages/NotFoundPage'))

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/tools" element={<ToolsListPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
