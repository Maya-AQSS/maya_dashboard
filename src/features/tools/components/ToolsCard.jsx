import { useState, useEffect, useRef, useId } from 'react'
import { useLocale, getDateLocale } from '../../../shared/i18n'

function ToolsCard({ tool, onToggleFavorite, showLastUsed }) {
  const { t, locale } = useLocale()
  const isFavorite = Boolean(tool.isFavorite)
  const [showConfirm, setShowConfirm] = useState(false)
  const titleId = useId()
  const starButtonRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const prevConfirmOpen = useRef(false)

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

  useEffect(() => {
    if (!showConfirm) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setShowConfirm(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    cancelButtonRef.current?.focus()
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showConfirm])

  useEffect(() => {
    if (prevConfirmOpen.current && !showConfirm) {
      requestAnimationFrame(() => starButtonRef.current?.focus())
    }
    prevConfirmOpen.current = showConfirm
  }, [showConfirm])

  const formattedLastUsedAt = tool.lastUsedAt
    ? new Date(tool.lastUsedAt).toLocaleString(getDateLocale(locale), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : t('tools.noData')

  const title = isFavorite
    ? t('tools.removeFromFavoritesTitle', { name: tool.name })
    : t('tools.addToFavoritesTitle', { name: tool.name })

  const message = isFavorite
    ? t('tools.removeFromFavoritesMessage')
    : t('tools.addToFavoritesMessage')

  return (
    <>
      <article className="bg-white dark:bg-odoo-dark-surface rounded-[0.9rem] p-4 pt-[1rem] border border-gray-200 dark:border-odoo-dark-border shadow-[0_10px_20px_-10px_rgba(15,23,42,0.18),0_2px_4px_-2px_rgba(15,23,42,0.12)] dark:shadow-none flex flex-col gap-2.5 h-full transition hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-12px_rgba(15,23,42,0.25),0_4px_8px_-4px_rgba(15,23,42,0.14)] dark:hover:shadow-none">
        <header className="flex items-center justify-end gap-2">
          <button
            ref={starButtonRef}
            type="button"
            className="py-1 px-2 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-purple-200 dark:border-odoo-dark-border text-odoo-primary text-xs font-semibold uppercase tracking-wide cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-odoo-dark-surface"
            onClick={handleStarClick}
            aria-label={isFavorite ? t('tools.removeFromFavorites') : t('tools.addToFavorites')}
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
          <h3 className="m-0 text-base font-semibold text-purple-800 dark:text-odoo-dark-text">{tool.name}</h3>
          <p className="mb-2 text-sm text-gray-600 dark:text-odoo-dark-muted">{tool.description}</p>
          {showLastUsed && (
            <p className="mt-auto text-xs text-gray-500 dark:text-odoo-dark-muted text-center">
              {t('tools.lastUsed')} {formattedLastUsedAt}
            </p>
          )}
        </a>
      </article>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-slate-900/35 dark:bg-odoo-dark-bg/80 flex items-center justify-center z-40"
          onClick={handleCancel}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="bg-white dark:bg-odoo-dark-surface rounded-[0.9rem] p-4 sm:p-5 max-w-[360px] w-[90%] border border-transparent dark:border-odoo-dark-border shadow-[0_20px_40px_-16px_rgba(15,23,42,0.4),0_0_0_1px_rgba(148,163,184,0.4)] dark:shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 id={titleId} className="m-0 mb-2 text-base font-semibold text-gray-900 dark:text-odoo-dark-text">
              {title}
            </h4>
            <p className="m-0 mb-4 text-sm text-gray-600 dark:text-odoo-dark-muted">{message}</p>
            <div className="flex justify-end gap-2">
              <button
                ref={cancelButtonRef}
                type="button"
                className="py-1.5 px-3.5 rounded-full border border-gray-300 dark:border-odoo-dark-border bg-white dark:bg-odoo-dark-surface text-gray-600 dark:text-odoo-dark-text text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-odoo-dark-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-odoo-primary"
                onClick={handleCancel}
              >
                {t('profile.cancel')}
              </button>
              <button
                type="button"
                className="py-1.5 px-3.5 rounded-full border-none bg-odoo-primary text-gray-50 text-sm font-medium cursor-pointer hover:bg-odoo-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                onClick={handleConfirm}
              >
                {t('tools.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


export default ToolsCard
