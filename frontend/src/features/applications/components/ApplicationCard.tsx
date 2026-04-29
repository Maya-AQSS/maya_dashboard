import { useState } from'react'
import { ConfirmDialog } from'@maya/shared-ui-react'
import { useLocale } from'../../../shared/i18n'

function ApplicationCard({ app, onToggleFavorite }) {
 const { t } = useLocale()
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

 const modalTitle = isFavorite
 ? t('favorites.removeFromFavoritesTitle', { name: app.name })
 : t('favorites.addToFavoritesTitle', { name: app.name })

 const modalMessage = isFavorite
 ? t('favorites.removeFromFavoritesMessage')
 : t('favorites.addToFavoritesMessage')

 return (<>
 <ConfirmDialog
 open={showConfirm}
 title={modalTitle}
 description={modalMessage}
 confirmLabel={t('favorites.confirmButton')}
 cancelLabel={t('favorites.cancelButton')}
 variant={isFavorite ?'danger' :'primary'}
 onConfirm={handleConfirm}
 onCancel={() => setShowConfirm(false)}
 />
 <article className="bg-surface-container-low rounded-[0.9rem] p-4 pt-[1rem] border border-outline shadow-[0_10px_20px_-10px_rgba(15,23,42,0.18),0_2px_4px_-2px_rgba(15,23,42,0.12)] dark:shadow-none flex flex-col gap-2.5 h-full transition hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-12px_rgba(15,23,42,0.25),0_4px_8px_-4px_rgba(15,23,42,0.14)] dark:hover:shadow-none">
 <header className="flex items-center justify-end gap-2">
 <button
 type="button"
 className={`py-1 px-2 rounded-full border text-xs font-semibold uppercase tracking-wide cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-container-low ${
 isFavorite
 ?'bg-warning-light dark:bg-warning-dark/40 border-warning/60 text-warning-dark focus-visible:ring-warning'
 :'bg-transparent dark:bg-transparent border-outline text-on-surface-muted hover:border-outline hover:text-on-surface-variant focus-visible:ring-outline'
 }`}
 onClick={handleStarClick}
 aria-label={isFavorite ? t('applications.removeFromFavorites') : t('applications.addToFavorites')}
 aria-pressed={isFavorite}
 >
 {isFavorite ?'★' :'☆'}
 </button>
 </header>

 <a
 href={app.documentationUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="no-underline text-inherit flex flex-col flex-1"
 >
 <h3 className="m-0 text-base font-semibold text-primary-hover">{app.name}</h3>
 <p className="mb-2 text-sm text-on-surface-variant">{app.description}</p>
 </a>
 </article>
 </>
 )
}

export default ApplicationCard
