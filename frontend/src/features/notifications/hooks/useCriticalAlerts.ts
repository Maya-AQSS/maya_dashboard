import { useNotifications } from './useNotifications'
import type { Notification } from '../types/notification'

export interface CriticalAlertItem {
  id: number
  title: string
  body: string
  severity: string
  createdAt: string
  acknowledged: boolean
  canDismiss: boolean
}

/**
 * Critical-severity notifications scoped to the dashboard widget.
 * Replaces the legacy useUserAlerts/usePanelAlerts hooks now that
 * alerts live in the unified notifications table.
 */
export function useCriticalAlerts() {
  const { notifications, loading, error, refresh } = useNotifications({
    scope: 'dashboard',
    is_critical: true,
    acknowledged: false,
  })

  const alerts: CriticalAlertItem[] = notifications.map((n: Notification) => ({
    id: n.id,
    title: n.title,
    body: n.body ?? '',
    severity: n.severity ?? 'high',
    createdAt: n.created_at,
    acknowledged: n.acknowledged_at !== null,
    canDismiss: true,
  }))

  return { alerts, loading, error, refresh }
}
