import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] dark:bg-odoo-dark-bg">
      <header className="bg-odoo-primary dark:bg-odoo-dark-surface text-gray-50 border-b border-transparent dark:border-odoo-dark-border shadow-[0_2px_6px_rgba(15,23,42,0.28)] dark:shadow-none">
        <Navbar />
        <div className="max-w-[1200px] mx-auto pt-2 pb-4 sm:pb-5 px-4 sm:px-6 text-center">
          <h1 className="m-0 text-xl sm:text-[1.6rem]">Dashboard</h1>
          <p className="mt-1.5 mb-0 text-sm sm:text-[0.95rem] text-gray-200 opacity-95">
            Bienvenido a tu panel de control
          </p>
        </div>
      </header>

      <main className="flex-1 py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="py-3 px-4 sm:px-8 pb-6 text-center text-xs sm:text-sm text-[#6b6f7b] dark:text-odoo-dark-muted">
        <p>Dashboard React</p>
      </footer>
    </div>
  )
}

export default MainLayout