import { useState, useRef } from 'react'
import { ConfirmDialog } from '@maya/shared-ui-react'
import { useLocale } from '../../../shared/i18n'

function ToolsCard({ tool, onToggleFavorite }) {
  const { t } = useLocale()
  const isFavorite = Boolean(tool.isFavorite)
  const [showConfirm, setShowConfirm] = useState(false)
  const starButtonRef = useRef(null)

  const handleStarClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    onToggleFavorite(tool.id)
    setShowConfirm(false)
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  const title = isFavorite
    ? t('tools.removeFromFavoritesTitle', { name: tool.name })
    : t('tools.addToFavoritesTitle', { name: tool.name })

  const message = isFavorite
    ? t('tools.removeFromFavoritesMessage')
    : t('tools.addToFavoritesMessage')

  return (
    <>
      <article className="bg-ui-card dark:bg-ui-dark-card rounded-[0.9rem] p-4 pt-[1rem] border border-ui-border dark:border-ui-dark-border shadow-[0_10px_20px_-10px_rgba(15,23,42,0.18),0_2px_4px_-2px_rgba(15,23,42,0.12)] dark:shadow-none flex flex-col gap-2.5 h-full transition hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-12px_rgba(15,23,42,0.25),0_4px_8px_-4px_rgba(15,23,42,0.14)] dark:hover:shadow-none">
        <header className="flex items-center justify-end gap-2">
          <button
            ref={starButtonRef}
            type="button"
            className={`py-1 px-2 rounded-full border text-xs font-semibold uppercase tracking-wide cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ui-dark-card ${
              isFavorite
                ? 'bg-warning-light dark:bg-warning-dark/40 border-warning/60 dark:border-warning/50 text-warning-dark dark:text-warning focus-visible:ring-warning'
                : 'bg-transparent dark:bg-transparent border-ui-border dark:border-ui-dark-border text-text-muted dark:text-text-secondary hover:border-ui-border hover:text-text-secondary dark:hover:border-ui-dark-border dark:hover:text-text-dark-secondary focus-visible:ring-ui-border'
            }`}
            onClick={handleStarClick}
            aria-label={isFavorite ? t('tools.removeFromFavorites') : t('tools.addToFavorites')}
            aria-pressed={isFavorite}
            aria-haspopup="dialog"
            aria-expanded={showConfirm}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </header>

        <a
          href={tool.documentationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline text-inherit flex flex-col flex-1"
        >
          <h3 className="m-0 text-base font-semibold text-odoo-purple-d dark:text-text-dark-primary">{tool.name}</h3>
          <p className="mb-2 text-sm text-text-secondary dark:text-text-dark-secondary">{tool.description}</p>
        </a>
      </article>

      <ConfirmDialog
        open={showConfirm}
        title={title}
        description={message}
        confirmLabel={t('tools.confirm')}
        cancelLabel={t('profile.cancel')}
        variant={isFavorite ? 'danger' : 'primary'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  )
}


export default ToolsCard
