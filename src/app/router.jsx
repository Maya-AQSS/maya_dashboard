import { Routes, Route } from 'react-router-dom'

import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import ProfilePage from '../features/profile/pages/ProfilePage'
import AuthLayout from '../shared/components/AuthLayout'
import MainLayout from '../shared/components/MainLayout'

function AppRouter() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <AuthLayout>
                        <LoginPage />
                    </AuthLayout>
                }
            />
            <Route
                path="/register"
                element={
                    <AuthLayout>
                        <RegisterPage />
                    </AuthLayout>
                }
            />
            
            <Route
                path="/dashboard"
                element={
                    <MainLayout>
                        <DashboardPage />
                    </MainLayout>
                }
            />
            <Route
                path="/profile"
                element={
                    <MainLayout>
                        <ProfilePage />
                    </MainLayout>
                }
            />
        </Routes>
    )
}

export default AppRouter