import { useState, useEffect, useRef, useId } from 'react'
import { useLocale } from '../../../shared/i18n'
import useFavorites from '../hooks/useFavorites'

// ─── FavoriteCard ──────────────────────────────────────────────
function FavoriteCard({ fav, onRemove }) {
  const { t } = useLocale()
  const [showConfirm, setShowConfirm] = useState(false)
  const titleId = useId()
  const starButtonRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const prevConfirmOpen = useRef(false)

  const handleStarClick = (event) => { event.preventDefault(); event.stopPropagation(); setShowConfirm(true) }
  const handleConfirm = () => { onRemove(fav.id); setShowConfirm(false) }
  const handleCancel = () => { setShowConfirm(false) }

  useEffect(() => {
    if (!showConfirm) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); setShowConfirm(false) }
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

  return (
    <>
      <article className="bg-ui-card dark:bg-ui-dark-card rounded-[0.9rem] p-4 pt-[1rem] border border-ui-border dark:border-ui-dark-border shadow-[0_10px_20px_-10px_rgba(15,23,42,0.18),0_2px_4px_-2px_rgba(15,23,42,0.12)] dark:shadow-none flex flex-col gap-2.5 h-full transition hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-12px_rgba(15,23,42,0.25),0_4px_8px_-4px_rgba(15,23,42,0.14)] dark:hover:shadow-none">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-odoo-purple-d dark:text-text-dark-primary">{fav.name}</h3>
          <button
            ref={starButtonRef}
            type="button"
            aria-label={t('favorites.removeFromFavorites')}
            onClick={handleStarClick}
            className="py-1 px-2 rounded-full bg-warning-light dark:bg-warning-dark/40 border border-odoo-purple/20 dark:border-ui-dark-border text-odoo-purple text-xs font-semibold uppercase tracking-wide cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-warning dark:focus-visible:ring-offset-ui-dark-card"
          >
            ★
          </button>
        </div>
        {fav.description && (
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">{fav.description}</p>
        )}
        {fav.documentationUrl && (
          <a
            href={fav.documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto text-xs text-odoo-purple hover:underline"
          >
            {t('tools.documentation')}
          </a>
        )}
      </article>
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-ui-dark-bg/80 flex items-center justify-center z-40"
          onClick={handleCancel}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="bg-ui-card dark:bg-ui-dark-card rounded-[0.9rem] p-4 sm:p-5 max-w-[360px] w-[90%] border border-transparent dark:border-ui-dark-border shadow-[0_20px_40px_-16px_rgba(15,23,42,0.4),0_0_0_1px_rgba(148,163,184,0.4)] dark:shadow-none"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId} className="text-base font-semibold text-odoo-purple-d dark:text-text-dark-primary mb-2">
              {t('favorites.removeFromFavoritesTitle', { name: fav.name })}
            </h2>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
              {t('favorites.removeFromFavoritesMessage')}
            </p>
            <div className="flex justify-end gap-2">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={handleCancel}
                className="py-1.5 px-3 rounded-lg text-sm font-medium text-text-secondary dark:text-text-dark-secondary hover:bg-ui-body dark:hover:bg-ui-dark-bg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-odoo-purple"
              >
                {t('profile.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="py-1.5 px-3 rounded-lg text-sm font-medium bg-odoo-purple text-text-inverse hover:bg-odoo-purple transition focus:outline-none focus-visible:ring-2 focus-visible:ring-odoo-purple focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ui-dark-card"
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

// ─── FavoritesList ─────────────────────────────────────────────
function FavoritesList() {
  const { t } = useLocale()
  const { favorites, loading, error, remove } = useFavorites()

  if (loading) return <p className="text-sm text-text-secondary dark:text-text-dark-secondary p-4">{t('favorites.loading')}</p>
  if (error) return <p className="text-sm text-danger-dark dark:text-danger-light p-4">{error}</p>
  if (!favorites.length) return <p className="text-sm text-text-secondary dark:text-text-dark-secondary p-4">{t('favorites.noFavorites')}</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
      {favorites.map((fav) => (
        <FavoriteCard key={fav.id} fav={fav} onRemove={remove} />
      ))}
    </div>
  )
}

export default FavoritesList
