import { useUserAlerts } from '../../alerts/hooks/useUserAlerts'

const COLOR_CLASSES = {
  amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200',
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
  red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
  green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200',
}

const BUTTON_CLASSES = {
  amber: 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-800/40 dark:hover:bg-amber-700/40 text-amber-900 dark:text-amber-100',
  blue: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-800/40 dark:hover:bg-blue-700/40 text-blue-900 dark:text-blue-100',
  red: 'bg-red-100 hover:bg-red-200 dark:bg-red-800/40 dark:hover:bg-red-700/40 text-red-900 dark:text-red-100',
  green: 'bg-green-100 hover:bg-green-200 dark:bg-green-800/40 dark:hover:bg-green-700/40 text-green-900 dark:text-green-100',
}

function UserAlertsWidget() {
  const { alerts, loading, dismiss, clockIn } = useUserAlerts()

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-1">
        {[1, 2].map((n) => (
          <div key={n} className="h-10 bg-gray-200 dark:bg-odoo-dark-border rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!alerts.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-odoo-dark-muted text-center py-4">
        No hay alertas
      </p>
    )
  }

  const handleAction = (alert) => {
    if (alert.actionKind === 'clockIn') {
      clockIn()
      return
    }
    if (alert.actionUrl) {
      window.location.assign(alert.actionUrl)
    }
  }

  return (
    <div className="flex flex-col gap-2 overflow-auto h-full">
      {alerts.map((alert) => {
        const colorCls = COLOR_CLASSES[alert.color] ?? COLOR_CLASSES.blue
        const btnCls = BUTTON_CLASSES[alert.color] ?? BUTTON_CLASSES.blue
        return (
          <div
            key={alert.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${colorCls}`}
          >
            <span className="flex-1">{alert.text}</span>
            {alert.actionLabel && (
              <button
                type="button"
                onClick={() => handleAction(alert)}
                className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium transition ${btnCls}`}
              >
                {alert.actionLabel}
              </button>
            )}
            {alert.canDismiss !== false && (
              <button
                type="button"
                onClick={() => dismiss(alert.id)}
                aria-label="Descartar alerta"
                title="Descartar"
                className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-sm transition ${btnCls}`}
              >
                ×
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default UserAlertsWidget
