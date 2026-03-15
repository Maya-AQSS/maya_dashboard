import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../../shared/i18n'
import { loginApi } from '../api/authApi'
import { useAuth } from '../../../app/auth/AuthContext'

function useLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const { t } = useLocale()

  const checkLogin = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const { user } = await loginApi(credentials)
      setUser(user)
      navigate('/tools')
    } catch (err) {
      const msg = err?.message
      setError(msg?.startsWith('auth.') ? t(msg) : (msg || t('auth.error.generic')))
    } finally {
      setLoading(false)
    }
  }

  return { checkLogin, loading, error }
}

export default useLogin