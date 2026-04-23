import { useState } from 'react'
import { getDateLocale, useLocale } from '../../../shared/i18n'
import ConfirmModal from '../../../shared/components/ConfirmModal'

function ApplicationCard({ app, onToggleFavorite, showLastUsed }) {
  const { t, locale } = useLocale()
  const isFavorite = Boolean(app.isFavorite)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleStarClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    onToggleFavorite(app.id)
  }

  const formattedLastUsedAt = app.lastUsedAt
    ? new Date(app.lastUsedAt).toLocaleString(getDateLocale(locale), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : t('applications.noData')

  const modalTitle = isFavorite
    ? t('favorites.removeFromFavoritesTitle', { name: app.name })
    : t('favorites.addToFavoritesTitle', { name: app.name })

  const modalMessage = isFavorite
    ? t('favorites.removeFromFavoritesMessage')
    : t('favorites.addToFavoritesMessage')

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        title={modalTitle}
        message={modalMessage}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
      <article className="bg-white dark:bg-odoo-dark-surface rounded-[0.9rem] p-4 pt-[1rem] border border-gray-200 dark:border-odoo-dark-border shadow-[0_10px_20px_-10px_rgba(15,23,42,0.18),0_2px_4px_-2px_rgba(15,23,42,0.12)] dark:shadow-none flex flex-col gap-2.5 h-full transition hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-12px_rgba(15,23,42,0.25),0_4px_8px_-4px_rgba(15,23,42,0.14)] dark:hover:shadow-none">
        <header className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="py-1 px-2 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-purple-200 dark:border-odoo-dark-border text-odoo-primary text-xs font-semibold uppercase tracking-wide cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-odoo-dark-surface"
            onClick={handleStarClick}
            aria-label={isFavorite ? t('applications.removeFromFavorites') : t('applications.addToFavorites')}
            aria-pressed={isFavorite}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </header>

        <a
          href={app.documentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline text-inherit flex flex-col flex-1"
        >
          <h3 className="m-0 text-base font-semibold text-purple-800 dark:text-odoo-dark-text">{app.name}</h3>
          <p className="mb-2 text-sm text-gray-600 dark:text-odoo-dark-muted">{app.description}</p>
          {showLastUsed && (
            <p className="mt-auto text-xs text-gray-500 dark:text-odoo-dark-muted text-center">
              {t('applications.lastUsed')} {formattedLastUsedAt}
            </p>
          )}
        </a>
      </article>
    </>
  )
}

export default ApplicationCard
