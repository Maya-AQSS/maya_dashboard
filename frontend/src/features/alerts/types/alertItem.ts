export type AlertColor = 'red' | 'amber' | 'blue' | 'green'

/**
 * A normalized alert item for the dashboard user-alerts widget. Combines
 * clock-in reminders, critical notifications and manual panel alerts.
 */
export interface AlertItem {
  id: string
  color: AlertColor
  text: string
  actionLabel: string | null
  actionUrl?: string
  actionKind?: string
  canDismiss: boolean
}
