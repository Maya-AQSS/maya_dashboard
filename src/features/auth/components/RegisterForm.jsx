import { useState, useRef, useEffect } from 'react'
import useRegister from '../hooks/useRegister'
import { useLocale } from '../../../shared/i18n'

function RegisterForm() {
  const { t } = useLocale()
  const { checkRegister, loading, error } = useRegister()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errorForm, setErrorForm] = useState(null)

  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const passwordConfirmationRef = useRef(null)

  useEffect(() => {
    const msg = t('auth.requiredField')
    if (nameRef.current) nameRef.current.setCustomValidity(name.trim() ? '' : msg)
    if (emailRef.current) emailRef.current.setCustomValidity(email.trim() ? '' : msg)
    if (passwordRef.current) passwordRef.current.setCustomValidity(password.trim() ? '' : msg)
    if (passwordConfirmationRef.current) passwordConfirmationRef.current.setCustomValidity(passwordConfirmation.trim() ? '' : msg)
  }, [t, name, email, password, passwordConfirmation])

  const onSubmit = async (event) => {
    event.preventDefault()
    if (password !== passwordConfirmation) {
      setErrorForm(t('auth.passwordMismatch'))
      return
    }
    setErrorForm(null)
    await checkRegister({ name, email, password })
  }

  const inputClass =
    'py-2 px-3 rounded-lg border border-slate-300 dark:border-odoo-dark-border bg-white dark:bg-odoo-dark-surface text-gray-900 dark:text-odoo-dark-text text-[0.95rem] placeholder:text-gray-500 dark:placeholder:text-odoo-dark-muted focus:outline-2 focus:outline-odoo-primary focus:outline-offset-1 focus:border-transparent'
  const labelClass = 'text-sm font-medium text-gray-600 dark:text-odoo-dark-muted'
  const fieldClass = 'flex flex-col gap-1.5'

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className={fieldClass}>
        <label htmlFor="name" className={labelClass}>{t('auth.name')}</label>
        <input
          ref={nameRef}
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('auth.placeholderName')}
          required
          className={inputClass}
        />
      </div>

      <div className={fieldClass}>
        <label htmlFor="email" className={labelClass}>{t('auth.email')}</label>
        <input
          ref={emailRef}
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.placeholderEmail')}
          required
          className={inputClass}
        />
      </div>

      <div className={fieldClass}>
        <label htmlFor="password" className={labelClass}>{t('auth.password')}</label>
        <input
          ref={passwordRef}
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.placeholderPassword')}
          required
          className={inputClass}
        />
      </div>

      <div className={fieldClass}>
        <label htmlFor="passwordConfirmation" className={labelClass}>{t('auth.confirmPassword')}</label>
        <input
          ref={passwordConfirmationRef}
          id="passwordConfirmation"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder={t('auth.placeholderPassword')}
          required
          className={inputClass}
        />
      </div>

      {errorForm && <p className="text-red-800 dark:text-red-400 text-sm">{errorForm}</p>}
      {error && <p className="text-red-800 dark:text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full sm:w-auto py-2.5 px-4 rounded-xl border-none bg-odoo-primary text-gray-50 font-semibold cursor-pointer text-[0.95rem] disabled:opacity-70 disabled:cursor-default hover:enabled:bg-odoo-primary-hover"
      >
        {loading ? t('auth.submitRegisterLoading') : t('auth.submitRegister')}
      </button>
    </form>
  )
}

export default RegisterForm