import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi } from '../api/authApi'
import { useAuth } from '../../../app/auth/AuthContext'

function useLogin() {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()
    const { setUser } = useAuth()

    const login = async (credentials) => {
        
        setLoading(true)
        setError(null)
        
        try {
            const user = await loginApi(credentials)
            setUser(user)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message ?? 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return { login, loading, error }
}

export {
    useLogin,
}