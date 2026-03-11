import { Link } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'

function RegisterPage() {
  return (
    <>
      <h2>Regístrate</h2>
      <RegisterForm />
      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </>
  )
}

export default RegisterPage