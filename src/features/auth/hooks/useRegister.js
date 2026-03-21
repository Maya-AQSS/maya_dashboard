import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '../../../shared/i18n'
import { registerApi } from '../api/authApi'
import { useAuth } from '../../../app/auth/useAuth.js'

function useRegister() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const { t } = useLocale()

  const checkRegister = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const { user } = await registerApi(credentials)
      setUser(user)
      navigate('/tools')
    } catch (err) {
      const msg = err?.message
      setError(msg?.startsWith('auth.') ? t(msg) : (msg || t('auth.error.generic')))
    } finally {
      setLoading(false)
    }
  }

  return { checkRegister, loading, error }
}

export default useRegister