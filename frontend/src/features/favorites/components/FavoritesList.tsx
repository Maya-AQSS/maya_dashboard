import { useState, useRef } from'react'
import { ConfirmDialog } from'@maya/shared-ui-react'
import { useLocale } from'../../../shared/i18n'
import useFavorites from'../hooks/useFavorites'

// ─── FavoriteCard ──────────────────────────────────────────────
function FavoriteCard({ fav, onRemove }) {
 const { t } = useLocale()
 const [showConfirm, setShowConfirm] = useState(false)
 const starButtonRef = useRef(null)

 const handleStarClick = (event) => { event.preventDefault(); event.stopPropagation(); setShowConfirm(true) }
 const handleConfirm = () => { onRemove(fav.id); setShowConfirm(false) }
 const handleCancel = () => { setShowConfirm(false) }

 return (<>
 <article className="bg-surface-container-low rounded-[0.9rem] p-4 pt-[1rem] border border-outline shadow-[0_10px_20px_-10px_rgba(15,23,42,0.18),0_2px_4px_-2px_rgba(15,23,42,0.12)] dark:shadow-none flex flex-col gap-2.5 h-full transition hover:-translate-y-0.5 hover:shadow-[0_14px_24px_-12px_rgba(15,23,42,0.25),0_4px_8px_-4px_rgba(15,23,42,0.14)] dark:hover:shadow-none">
 <div className="flex items-start justify-between gap-2">
 <h3 className="text-base font-semibold text-primary-hover">{fav.name}</h3>
 {/* Star toggle: pattern de favorito (icon-only). Mantiene estilos específicos. */}
 {/* eslint-disable-next-line react/forbid-elements -- icon toggle, no aplica <Button> */}
 <button
 ref={starButtonRef}
 type="button"
 aria-label={t('favorites.removeFromFavorites')}
 onClick={handleStarClick}
 className="py-1 px-2 rounded-full bg-warning-light dark:bg-warning-dark/40 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wide cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-warning dark:focus-visible:ring-offset-surface-container-low"
 >
 ★
 </button>
 </div>
 {fav.description && (<p className="text-sm text-on-surface-variant">{fav.description}</p>
 )}
 {fav.documentationUrl && (<a
 href={fav.documentationUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="mt-auto text-xs text-primary hover:underline"
 >
 {t('tools.documentation')}
 </a>
 )}
 </article>
 <ConfirmDialog
 open={showConfirm}
 title={t('favorites.removeFromFavoritesTitle', { name: fav.name })}
 description={t('favorites.removeFromFavoritesMessage')}
 confirmLabel={t('tools.confirm')}
 cancelLabel={t('profile.cancel')}
 variant="danger"
 onConfirm={handleConfirm}
 onCancel={handleCancel}
 />
 </>
 )
}

// ─── FavoritesList ─────────────────────────────────────────────
function FavoritesList() {
 const { t } = useLocale()
 const { favorites, loading, error, remove } = useFavorites()

 if (loading) return <p className="text-sm text-on-surface-variant p-4">{t('favorites.loading')}</p>
 if (error)
 return (<p role="alert" aria-live="assertive" className="text-sm text-danger-dark dark:text-danger-light p-4">
 {error}
 </p>
 )
 if (!favorites.length) return <p className="text-sm text-on-surface-variant p-4">{t('favorites.noFavorites')}</p>

 return (<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
 {favorites.map((fav) => (<FavoriteCard key={fav.id} fav={fav} onRemove={remove} />
 ))}
 </div>
 )
}

export default FavoritesList
