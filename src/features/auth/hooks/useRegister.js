import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerApi } from '../api/AuthApi'
import { useAuth } from '../../../app/auth/AuthContext'

function useRegister() {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const navigate = useNavigate()
    const { setUser } = useAuth()

    const checkRegister = async (credentials) => {
        setLoading(true)
        setError(null)

        try {
            const user = await registerApi(credentials)

            setUser(user)

            navigate('/technologies')
        } catch (err) {
            setError(err.message ?? 'Error al registrarse')
        } finally {
            setLoading(false)
        }
    }

    return { checkRegister, loading, error }
}

export default useRegister