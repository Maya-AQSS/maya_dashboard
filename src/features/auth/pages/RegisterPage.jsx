import { Link } from 'react-router-dom'
import RegisterForm from '../components/RegisterForm'

function RegisterPage() {
  return (
    <>
      <h2 className="m-0 mb-5 text-center text-[1.35rem] text-gray-900 dark:text-odoo-dark-text uppercase tracking-[0.05em]">
        Regístrate
      </h2>
      <RegisterForm />
      <p className="mt-5 pt-4 border-t border-gray-200 dark:border-odoo-dark-border text-center text-sm text-gray-600 dark:text-odoo-dark-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="auth-switch-link">
          Inicia sesión
        </Link>
      </p>
    </>
  )
}

export default RegisterPage