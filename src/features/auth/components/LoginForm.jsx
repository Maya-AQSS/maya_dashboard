import { useState, useRef, useEffect } from 'react'
import useLogin from '../hooks/useLogin'
import { useLocale } from '../../../shared/i18n'

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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-gray-600 dark:text-odoo-dark-muted">
          {t('auth.email')}
        </label>
        <input
          ref={emailRef}
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.placeholderEmail')}
          required
          className="py-2 px-3 rounded-lg border border-slate-300 dark:border-odoo-dark-border bg-white dark:bg-odoo-dark-surface text-gray-900 dark:text-odoo-dark-text text-[0.95rem] placeholder:text-gray-500 dark:placeholder:text-odoo-dark-muted focus:outline-2 focus:outline-odoo-primary focus:outline-offset-1 focus:border-transparent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-gray-600 dark:text-odoo-dark-muted">
          {t('auth.password')}
        </label>
        <input
          ref={passwordRef}
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.placeholderPasswordMasked')}
          required
          className="py-2 px-3 rounded-lg border border-slate-300 dark:border-odoo-dark-border bg-white dark:bg-odoo-dark-surface text-gray-900 dark:text-odoo-dark-text text-[0.95rem] placeholder:text-gray-500 dark:placeholder:text-odoo-dark-muted focus:outline-2 focus:outline-odoo-primary focus:outline-offset-1 focus:border-transparent"
        />
      </div>

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