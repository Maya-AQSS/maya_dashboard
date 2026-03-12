import { Routes, Route } from 'react-router-dom'

import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import TechnologiesListPage from '../features/technologies/pages/TechnologiesListPage'
import ProfilePage from '../features/profile/pages/ProfilePage'
import AuthLayout from '../shared/components/AuthLayout'
import MainLayout from '../shared/components/MainLayout'
import RequireAuth from './auth/RequireAuth'


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
                    <Route path="/technologies" element={<TechnologiesListPage />} />
                    
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
            </Route>
        </Routes>
    )
}

export default AppRouter