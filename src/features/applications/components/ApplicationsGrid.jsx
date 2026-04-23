import { useLocale } from '../../../shared/i18n'
import ApplicationCard from './ApplicationCard'

function ApplicationsGrid({ apps, onToggleFavorite }) {
  const { t } = useLocale()
  if (!apps || apps.length === 0) return <p className="text-gray-900 dark:text-odoo-dark-text">{t('applications.noApplications')}</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-5">
      {apps.map((app) => (
        <ApplicationCard
          key={app.id}
          app={app}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}

export default ApplicationsGrid
