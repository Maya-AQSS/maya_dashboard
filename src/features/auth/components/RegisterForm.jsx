import { useState } from 'react'
import useRegister from '../hooks/useRegister'
import styles from './AuthForm.module.css'

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
    <form onSubmit={onSubmit} className={styles.authForm}>
      
      <div className={styles.formField}>
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

      <div className={styles.formField}>
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

      <div className={styles.formField}>
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

      <div className={styles.formField}>
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

      {errorForm && <p className={styles.formError}>{errorForm}</p>}
      {error && <p className={styles.formError}>{error}</p>}

      <button type="submit" disabled={loading} className={styles.primaryButton}>
        {loading ? 'Registrando…' : 'Registrarse'}
      </button>
    </form>
  )
}

export default RegisterForm