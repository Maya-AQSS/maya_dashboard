import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSystemAlerts } from './useSystemAlerts'
import { useFichajeAlerts } from './useFichajeAlerts'

export type { AlertItem } from './useSystemAlerts'

const DISMISSED_KEY = 'maya:dismissed-alerts'
const DISMISSED_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface DismissedEntry {
  ids: string[]
  expiresAt: number
}

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    if (!raw) return new Set()
    const entry: DismissedEntry = JSON.parse(raw)
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(DISMISSED_KEY)
      return new Set()
    }
    return new Set(entry.ids)
  } catch {
    return new Set()
  }
}

function saveDismissed(ids: Set<string>): void {
  const entry: DismissedEntry = { ids: [...ids], expiresAt: Date.now() + DISMISSED_TTL_MS }
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(entry))
}

export function useUserAlerts() {
  const { alerts: systemAlerts, loading } = useSystemAlerts()
  const { alerts: fichajeAlerts, clockIn } = useFichajeAlerts()
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed)

  useEffect(() => {
    saveDismissed(dismissed)
  }, [dismissed])

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => { const next = new Set(prev); next.add(id); return next })
  }, [])

  const alerts = useMemo(
    () => [...fichajeAlerts, ...systemAlerts].filter((a) => !dismissed.has(a.id)),
    [fichajeAlerts, systemAlerts, dismissed],
  )

  return { alerts, loading, dismiss, clockIn }
}
