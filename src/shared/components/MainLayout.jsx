import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useLocale } from '../i18n'

function MainLayout() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] dark:bg-odoo-dark-bg">
      <header className="bg-odoo-primary text-gray-50 border-b border-transparent dark:border-odoo-dark-border shadow-[0_2px_6px_rgba(15,23,42,0.28)] dark:shadow-none">
        <Navbar />
      </header>

      <main className="flex-1 py-5 px-6 sm:py-6 sm:px-8 md:px-10 lg:px-12">
        <div className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <footer className="mt-auto py-4 px-5 sm:py-5 sm:px-8 md:px-10 border-t border-transparent dark:border-odoo-dark-border bg-odoo-primary dark:bg-odoo-dark-surface text-center text-xs sm:text-sm text-gray-200 dark:text-odoo-dark-muted shadow-[0_-2px_6px_rgba(15,23,42,0.08)] dark:shadow-none">
        <p className="m-0 max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">{t('layout.footer')}</p>
      </footer>
    </div>
  )
}

export default MainLayout