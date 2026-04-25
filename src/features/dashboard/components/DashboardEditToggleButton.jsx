import { useLocale } from '../../../shared/i18n'

function GearIcon({ className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function DashboardEditToggleButton({ editable, onToggle }) {
  const { t } = useLocale()

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={editable}
      aria-label={editable ? t('dashboard.exitEdit') : t('dashboard.editDashboard')}
      title={editable ? t('dashboard.exitEdit') : t('dashboard.editDashboard')}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition ${
        editable
          ? 'bg-odoo-purple border-odoo-purple text-text-inverse hover:bg-odoo-purple-d'
          : 'border-ui-border dark:border-ui-dark-border text-text-secondary dark:text-text-dark-primary hover:bg-ui-body dark:hover:bg-ui-dark-bg'
      }`}
    >
      <GearIcon />
    </button>
  )
}

export default DashboardEditToggleButton
