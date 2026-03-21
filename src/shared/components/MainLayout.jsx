import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useLocale } from '../i18n'

function MainLayout() {
  const { t } = useLocale()
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f7] dark:bg-odoo-dark-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-3 focus:left-3 focus:rounded-lg focus:bg-white focus:text-gray-900 focus:px-4 focus:py-2 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        {t('layout.skipToContent')}
      </a>
      <header className="bg-odoo-primary text-gray-50 border-b border-transparent dark:border-odoo-dark-border shadow-[0_2px_6px_rgba(15,23,42,0.28)] dark:shadow-none">
        <Navbar />
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 py-5 px-6 sm:py-6 sm:px-8 md:px-10 lg:px-12 outline-none"
      >
        <div className="max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <footer className="hidden sm:block mt-auto py-3 px-5 sm:px-8 md:px-10 border-t border-transparent dark:border-odoo-dark-border bg-odoo-primary text-center text-xs text-gray-200 dark:text-odoo-dark-muted shadow-[0_-2px_6px_rgba(15,23,42,0.08)] dark:shadow-none">
        <p className="m-0 max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto uppercase tracking-[0.08em] font-medium">{t('layout.footerShort')}</p>
      </footer>
    </div>
  )
}

export default MainLayout