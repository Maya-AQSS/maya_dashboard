import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useFichajeAlerts } from './useFichajeAlerts'
import { getActivePanelAlerts } from '../../panel-alerts/api/panelAlertsApi'
import { useCriticalAlerts } from '../../notifications/hooks/useCriticalAlerts'
import type { PanelAlert } from '../../panel-alerts/types/panelAlert'
import type { AlertItem } from '../types/alertItem'

export type { AlertItem }

function panelSeverityToColor(sev: string): 'red' | 'amber' | 'blue' {
  if (sev === 'critical' || sev === 'high') return 'red'
  if (sev === 'medium') return 'amber'
  return 'blue'
}

/** Elige la traducción del locale actual; cae al idioma por defecto y al espejo escalar. */
function pickLocalized(
  map: Record<string, string> | undefined,
  locale: string,
  defaultLocale: string,
  fallback: string,
): string {
  if (map) {
    if (map[locale]) return map[locale]
    if (map[defaultLocale]) return map[defaultLocale]
  }
  return fallback
}

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
    localStorage.removeItem(DISMISSED_KEY)
    return new Set()
  }
}

function saveDismissed(ids: Set<string>): void {
  const entry: DismissedEntry = { ids: [...ids], expiresAt: Date.now() + DISMISSED_TTL_MS }
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(entry))
}

/**
 * Orchestrator for the dashboard user-alerts widget. Combines three sources:
 *   - clock-in reminders (useFichajeAlerts) — local domain
 *   - critical notifications (useCriticalAlerts) — system-generated, scope=dashboard
 *   - user-pinned panel alerts (panel-alerts API)
 *
 * Critical notifications previously came from /api/v1/alerts via useSystemAlerts;
 * after the unification (Phase 2) they live in the same notifications table with
 * is_critical=true, scope='dashboard'.
 */
export function useUserAlerts() {
  const { token, user } = useAuth()
  const { locale } = useLocale()
  const { alerts: fichajeAlerts, clockIn } = useFichajeAlerts()
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissed)

  const { data: rawPanelAlerts = [], isPending: loadingPanel } = useQuery<PanelAlert[]>({
    queryKey: ['panel-alerts-active', user?.sub],
    queryFn: getActivePanelAlerts,
    enabled: !!token,
    staleTime: 60_000,
    retry: 1,
  })

  const { alerts: rawCriticalAlerts, loading: loadingCritical } = useCriticalAlerts()

  const panelAlerts = useMemo<AlertItem[]>(
    () => rawPanelAlerts.map((a) => {
      const dl = a.default_locale ?? 'es'
      return {
        id: `panel:${a.id}`,
        color: panelSeverityToColor(a.severity),
        text: pickLocalized(a.translations?.text, locale, dl, a.text),
        actionLabel: pickLocalized(a.translations?.action_label, locale, dl, a.action_label ?? '') || a.action_label,
        actionUrl: a.action_url ?? undefined,
        canDismiss: true,
      }
    }),
    [rawPanelAlerts, locale],
  )

  const criticalAlerts = useMemo<AlertItem[]>(
    () => rawCriticalAlerts.map((a) => ({
      id: `notif:${a.id}`,
      color: panelSeverityToColor(a.severity),
      text: a.title,
      canDismiss: true,
    })),
    [rawCriticalAlerts],
  )

  useEffect(() => {
    saveDismissed(dismissed)
  }, [dismissed])

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const alerts = useMemo(
    () => [...fichajeAlerts, ...criticalAlerts, ...panelAlerts].filter((a) => !dismissed.has(a.id)),
    [fichajeAlerts, criticalAlerts, panelAlerts, dismissed],
  )

  return { alerts, loading: loadingPanel || loadingCritical, dismiss, clockIn }
}
