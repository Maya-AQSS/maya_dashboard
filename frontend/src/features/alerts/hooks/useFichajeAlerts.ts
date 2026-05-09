import { useCallback, useMemo, useState } from 'react'
import type { AlertItem } from './useSystemAlerts'

function formatHHMM(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function useFichajeAlerts() {
  const [clockedInAt, setClockedInAt] = useState<Date | null>(null)

  const clockIn = useCallback(() => {
    setClockedInAt(new Date())
  }, [])

  const alerts = useMemo<AlertItem[]>(() => {
    if (!clockedInAt) {
      return [{
        id: 'local:no-fichado',
        color: 'amber',
        text: 'No has fichado hoy',
        actionLabel: 'Fichar',
        actionKind: 'clockIn',
        canDismiss: true,
      }]
    }
    return [{
      id: 'local:fichado',
      color: 'green',
      text: `Fichado a las ${formatHHMM(clockedInAt)}`,
      actionLabel: null,
      canDismiss: true,
    }]
  }, [clockedInAt])

  return { alerts, clockIn }
}
