import { useUserAlerts } from '../../alerts/hooks/useUserAlerts'

const COLOR_CLASSES = {
  amber: 'bg-warning-light dark:bg-warning-dark/20 border-warning/20 dark:border-warning/50 text-warning-dark dark:text-warning',
  blue: 'bg-info-light dark:bg-info-dark/20 border-info/20 dark:border-info/50 text-info-dark dark:text-info',
  red: 'bg-danger-light dark:bg-danger-dark/20 border-danger/20 dark:border-danger/50 text-danger-dark dark:text-danger',
  green: 'bg-success-light dark:bg-success-dark/20 border-success/20 dark:border-success/50 text-success-dark dark:text-success',
}

const BUTTON_CLASSES = {
  amber: 'bg-warning-light hover:bg-warning/20 dark:bg-warning-dark/40 dark:hover:bg-warning-dark/60 text-warning-dark dark:text-warning',
  blue: 'bg-info-light hover:bg-info/20 dark:bg-info-dark/40 dark:hover:bg-info-dark/60 text-info-dark dark:text-info',
  red: 'bg-danger-light hover:bg-danger/20 dark:bg-danger-dark/40 dark:hover:bg-danger-dark/60 text-danger-dark dark:text-danger',
  green: 'bg-success-light hover:bg-success/20 dark:bg-success-dark/40 dark:hover:bg-success-dark/60 text-success-dark dark:text-success',
}

function UserAlertsWidget() {
  const { alerts, loading, dismiss, clockIn } = useUserAlerts()

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-1">
        {[1, 2].map((n) => (
          <div key={n} className="h-10 bg-ui-border-l dark:bg-ui-dark-border rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (!alerts.length) {
    return (
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary text-center py-4">
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
