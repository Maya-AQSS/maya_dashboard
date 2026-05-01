import { Link } from 'react-router-dom'
import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'

function NotFoundPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const targetPath = user ? '/applications' : '/login'
  const actionLabel = user ? t('layout.notFoundBackDashboard') : t('layout.notFoundGoLogin')

  return (
    <div className="min-h-screen flex items-center justify-center bg-ui-body dark:bg-ui-dark-bg px-6">
      <div className="w-full max-w-[560px] rounded-2xl border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card px-8 py-10 text-center shadow-[0_18px_25px_-10px_rgba(17,24,39,0.2),0_4px_8px_-2px_rgba(17,24,39,0.08)] dark:shadow-none">
        <p className="text-5xl font-semibold text-odoo-purple m-0">404</p>
        <h1 className="mt-4 mb-2 text-2xl font-semibold text-text-primary dark:text-text-dark-primary">
          {t('layout.notFoundTitle')}
        </h1>
        <p className="m-0 text-sm sm:text-base text-text-secondary dark:text-text-dark-secondary">
          {t('layout.notFoundDescription')}
        </p>
        <Link
          to={targetPath}
          className="inline-flex items-center justify-center mt-6 py-2.5 px-5 rounded-full border-none bg-odoo-purple !text-text-inverse visited:!text-text-inverse text-sm font-semibold no-underline cursor-pointer transition hover:bg-odoo-purple-d"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
