import { Link } from 'react-router-dom'
import LoginForm from '../components/LoginForm'

function LoginPage() {
  return (
    <>
      <h2 className="m-0 mb-5 text-center text-[1.35rem] text-gray-900 dark:text-odoo-dark-text uppercase tracking-[0.05em]">
        Inicia sesión
      </h2>
      <LoginForm />
      <p className="mt-5 pt-4 border-t border-gray-200 dark:border-odoo-dark-border text-center text-sm text-gray-600 dark:text-odoo-dark-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="auth-switch-link">
          Regístrate
        </Link>
      </p>
    </>
  )
}

export default LoginPage