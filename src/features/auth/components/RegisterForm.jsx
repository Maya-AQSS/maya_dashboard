import { useState, useRef, useEffect } from 'react'
import useRegister from '../hooks/useRegister'
import { useLocale } from '../../../shared/i18n'
import FormField from '../../../shared/components/FormField'

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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormField
        ref={nameRef}
        label={t('auth.name')}
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('auth.placeholderName')}
        required
        autoComplete="name"
      />
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
        placeholder={t('auth.placeholderPassword')}
        required
        autoComplete="new-password"
      />
      <FormField
        ref={passwordConfirmationRef}
        label={t('auth.confirmPassword')}
        name="passwordConfirmation"
        type="password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        placeholder={t('auth.placeholderPassword')}
        required
        autoComplete="new-password"
      />

      {errorForm && (
        <p className="text-red-800 dark:text-red-400 text-sm" role="alert">
          {errorForm}
        </p>
      )}
      {error && (
        <p className="text-red-800 dark:text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

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