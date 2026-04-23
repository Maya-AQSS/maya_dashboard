import { useState, useRef, useEffect } from 'react'
import { useLocale } from '../../../shared/i18n'
import { WIDGET_REGISTRY } from '../widgets/registry'

function DashboardEditToolbar({ layout, onSave, onCancel, onAddWidget, onReset }) {
  const { t } = useLocale()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const existingIds = new Set(layout.map((item) => item.i))
  const availableToAdd = Object.values(WIDGET_REGISTRY).filter((def) => !existingIds.has(def.id))

  return (
    <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 mb-4 px-4 sm:px-6 py-2 bg-white/95 dark:bg-odoo-dark-surface/95 backdrop-blur border-b border-gray-200 dark:border-odoo-dark-border">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-medium text-gray-500 dark:text-odoo-dark-muted mr-2">
          {t('dashboard.editMode')}
        </span>
        <button
          type="button"
          onClick={onSave}
          className="py-1 px-3 rounded-full bg-odoo-primary hover:bg-odoo-primary-hover text-white text-xs font-medium transition"
        >
          {t('dashboard.save')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-1 px-3 rounded-full border border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/70 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition"
        >
          {t('dashboard.cancel')}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            disabled={availableToAdd.length === 0}
            className="py-1 px-3 rounded-full border border-amber-500 dark:border-amber-400/60 text-amber-700 dark:text-amber-300 text-xs font-medium hover:enabled:bg-amber-50 dark:hover:enabled:bg-amber-400/10 transition disabled:opacity-40 disabled:cursor-default"
          >
            + {t('dashboard.addWidget')}
          </button>
          {dropdownOpen && availableToAdd.length > 0 && (
            <div className="absolute left-0 top-full mt-1 z-[300] min-w-[180px] bg-ui-card dark:bg-ui-dark-card border border-ui-border dark:border-ui-dark-border rounded-xl shadow-lg overflow-hidden">
              {availableToAdd.map((def) => (
                <button
                  key={def.id}
                  type="button"
                  onClick={() => { onAddWidget(def.id); setDropdownOpen(false) }}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary dark:text-text-dark-primary hover:bg-ui-body dark:hover:bg-ui-dark-bg transition"
                >
                  {t(def.titleKey)}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onReset}
          className="py-1 px-3 rounded-full border border-gray-300 dark:border-white/20 text-gray-600 dark:text-white/50 text-xs font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition"
        >
          {t('dashboard.resetLayout')}
        </button>
      </div>
    </div>
  )
}

export default DashboardEditToolbar
