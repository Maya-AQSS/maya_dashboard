import { Link } from 'react-router-dom'
import LoginForm from '../components/LoginForm'

function LoginPage() {
  return (
    <>
      <h2>Inicia sesión</h2>
      <LoginForm />
      <p className="auth-switch">
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </>
  )
}

export default LoginPage