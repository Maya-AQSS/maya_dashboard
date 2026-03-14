import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,#9c6b98_0,#714b67_40%,#2c2c38_100%)]">
      <header className="pt-6 sm:pt-10 px-4 sm:px-6 pb-4 text-center text-gray-50">
        <h1 className="m-0 text-2xl sm:text-3xl tracking-[0.06em] uppercase">Dashboard React</h1>
        <p className="mt-3 max-w-[420px] mx-auto text-gray-200 text-sm sm:text-[0.95rem]">
          Accede a tu cuenta o regístrate para continuar
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[420px] bg-white dark:bg-odoo-dark-surface dark:border dark:border-odoo-dark-border rounded-2xl p-5 sm:p-9 shadow-[0_18px_25px_-10px_rgba(17,24,39,0.35),0_4px_8px_-2px_rgba(17,24,39,0.15)] dark:shadow-none">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AuthLayout