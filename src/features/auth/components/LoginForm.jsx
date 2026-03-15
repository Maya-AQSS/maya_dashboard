import { useState, useRef, useEffect } from 'react'
import useLogin from '../hooks/useLogin'
import { useLocale } from '../../../shared/i18n'
import FormField from '../../../shared/components/FormField'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const { t } = useLocale()
  const { checkLogin, loading, error } = useLogin()

  useEffect(() => {
    const msg = t('auth.requiredField')
    if (emailRef.current) emailRef.current.setCustomValidity(email.trim() ? '' : msg)
    if (passwordRef.current) passwordRef.current.setCustomValidity(password.trim() ? '' : msg)
  }, [t, email, password])

  const onSubmit = async (event) => {
    event.preventDefault()
    await checkLogin({ email, password })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField
        ref={emailRef}
        label={t('auth.email')}
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('auth.placeholderEmail')}
        required
        autoComplete="email"
      />
      <FormField
        ref={passwordRef}
        label={t('auth.password')}
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('auth.placeholderPasswordMasked')}
        required
        autoComplete="current-password"
      />

      {error && <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full sm:w-auto py-2.5 px-4 rounded-xl border-none bg-odoo-primary text-gray-50 font-semibold cursor-pointer text-[0.95rem] disabled:opacity-70 disabled:cursor-default hover:enabled:bg-odoo-primary-hover"
      >
        {loading ? t('auth.submitLoginLoading') : t('auth.submitLogin')}
      </button>
    </form>
  )
}

export default LoginForm