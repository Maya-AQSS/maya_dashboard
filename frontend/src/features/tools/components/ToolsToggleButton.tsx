import { useLocale } from '../../../shared/i18n'

function ToolsToggleButton({ showAll, onToggle }) {
  const { t } = useLocale()
  return (
    <button
      type="button"
      className="w-auto max-w-full py-2 sm:py-1.5 px-3.5 rounded-full border-none bg-odoo-purple text-text-inverse text-sm font-medium cursor-pointer shadow-[0_8px_16px_-10px_rgba(15,23,42,0.3),0_0_0_1px_rgba(148,163,184,0.35)] dark:shadow-none transition hover:bg-odoo-purple-d hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-12px_rgba(15,23,42,0.4),0_0_0_1px_rgba(148,163,184,0.5)] dark:hover:shadow-none"
      onClick={onToggle}
    >
      {showAll ? t('tools.viewFavoritesOnly') : t('tools.viewAll')}
    </button>
  )
}

export default ToolsToggleButton

