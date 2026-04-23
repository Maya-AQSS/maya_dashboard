import { useEffect } from 'react'
import { useLocale } from '../i18n'

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  const { t } = useLocale()

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-odoo-dark-surface rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-gray-900 dark:text-odoo-dark-text mb-2">{title}</h2>
        {message && (
          <p className="text-sm text-gray-500 dark:text-odoo-dark-muted mb-5">{message}</p>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-odoo-dark-text hover:bg-gray-100 dark:hover:bg-odoo-dark-border transition"
          >
            {t('favorites.cancelButton')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-odoo-primary hover:bg-odoo-primary/90 text-white transition"
          >
            {t('favorites.confirmButton')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
