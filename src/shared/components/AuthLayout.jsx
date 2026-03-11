import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="auth-layout">
      <header className="auth-header">
        <h1>Dashboard React</h1>
        <p>Accede a tu cuenta o regístrate para continuar</p>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <Outlet />
        </div>
      </main>

      <footer className="auth-footer">
        <p>Dashboard React</p>
      </footer>
    </div>
  )
}

export default AuthLayout