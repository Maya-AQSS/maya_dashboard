import { useCallback, useMemo, useState } from 'react'
import { useSystemAlerts } from './useSystemAlerts'
import { useFichajeAlerts } from './useFichajeAlerts'

export type { AlertItem } from './useSystemAlerts'

/**
 * Composes system alerts (backend) + fichaje alerts (local state) into a single
 * dismissible list. This is the only hook consumers should import.
 *
 * Split:
 *  - useSystemAlerts: network concern — fetches /api/v1/alerts
 *  - useFichajeAlerts: local-state concern — clock-in presence widget
 */
export function useUserAlerts() {
  const { alerts: systemAlerts, loading } = useSystemAlerts()
  const { alerts: fichajeAlerts, clockIn } = useFichajeAlerts()
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => { const next = new Set(prev); next.add(id); return next })
  }, [])

  const alerts = useMemo(
    () => [...fichajeAlerts, ...systemAlerts].filter((a) => !dismissed.has(a.id)),
    [fichajeAlerts, systemAlerts, dismissed],
  )

  return { alerts, loading, dismiss, clockIn }
}
