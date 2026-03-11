import { useState } from 'react'
import useLogin from '../hooks/useLogin'
import styles from './AuthForm.module.css'

function LoginForm() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { checkLogin, loading, error } = useLogin()

  const onSubmit = async (event) => {
    event.preventDefault()

    await checkLogin({ email, password })
  }

  
  return (
    <form onSubmit={onSubmit} className={styles.authForm}>

      {/* <FormField campo="email" /> */}
      <div className={styles.formField}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tuemail@ejemplo.com"
          required
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          required
        />
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      <button type="submit" disabled={loading} className={styles.primaryButton}>
        {loading ? 'Entrando…' : 'Entrar'}
      </button>

    </form>
  )
}

export default LoginForm