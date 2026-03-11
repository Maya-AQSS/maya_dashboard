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

    await checkRegister({
      name,
      email,
      password,
    })
  }

  return (
    <form onSubmit={onSubmit} className="auth-form">
      
      <div className="form-field">
        <label htmlFor="name">Nombre</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Juan Pérez"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="juan.perez@ejemplo.com"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="contraseña"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="passwordConfirmation">Confirmar contraseña</label>
        <input
          id="passwordConfirmation"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="contraseña"
          required
        />
      </div>

      {errorForm && <p className="form-error">{errorForm}</p>}
      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={loading} className="primary-button">
        {loading ? 'Registrando…' : 'Registrarse'}
      </button>
    </form>
  )
}

export default RegisterForm