import { useState } from 'react'
import useRegister from '../hooks/useRegister'

function RegisterForm() {
  const { checkRegister, loading, error } = useRegister()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errorForm, setErrorForm] = useState(null)

  const onSubmit = async (event) => {
    event.preventDefault()
    if (password !== passwordConfirmation) {
      setErrorForm('Las contraseñas no coinciden')
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
        <label htmlFor="name" className={labelClass}>Nombre</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          required
          className={inputClass}
        />
      </div>

      <div className={fieldClass}>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="juan.perez@ejemplo.com"
          required
          className={inputClass}
        />
      </div>

      <div className={fieldClass}>
        <label htmlFor="password" className={labelClass}>Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="contraseña"
          required
          className={inputClass}
        />
      </div>

      <div className={fieldClass}>
        <label htmlFor="passwordConfirmation" className={labelClass}>Confirmar contraseña</label>
        <input
          id="passwordConfirmation"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="contraseña"
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
        {loading ? 'Registrando…' : 'Registrarse'}
      </button>
    </form>
  )
}

export default RegisterForm