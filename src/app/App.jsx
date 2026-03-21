import { Suspense } from 'react'
import AppRouter from './router'
import { useLocale } from '../shared/i18n'

function App() {
  const { t } = useLocale()

  return (
    <Suspense
      fallback={(
        <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] dark:bg-odoo-dark-bg px-6">
          <p className="text-sm sm:text-base text-gray-700 dark:text-odoo-dark-text">
            {t('layout.routeLoading')}
          </p>
        </div>
      )}
    >
      <AppRouter />
    </Suspense>
  )
}

export default App
