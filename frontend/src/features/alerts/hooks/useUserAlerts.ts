import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

// Map backend alert severity -> local color bucket used by the widget.
function severityToColor(sev) {
  if (sev === 'critical' || sev === 'high') return 'red'
  if (sev === 'medium') return 'amber'
  if (sev === 'low') return 'blue'
  return 'blue'
}

function formatHHMM(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * Returns the combined list of alerts for the current user:
 *   1) System alerts persisted in the backend (/api/v1/alerts)
 *   2) Synthetic alerts computed from local client state:
 *      - "No has fichado hoy" (until the user clicks the clock-in button)
 *      - "Fichado a las HH:MM" (after the clock-in button is pressed)
 *      - "Perfil sin Basic data" (simulated until the profile is filled)
 *
 * Alerts are dismissible via `dismiss(id)` (local state only — server-side
 * ack/resolve isn't wired here so that the widget is independent from the
 * /api/v1/alerts PATCH routes).
 */
export function useUserAlerts() {
  const { token } = useAuth()

  const [backendAlerts, setBackendAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(() => new Set())
  const [clockedInAt, setClockedInAt] = useState(null)
  // Simulación fija: asumimos que el perfil no está completo.
  const [profileComplete] = useState(false)

  useEffect(() => {
    if (!token || !API_BASE) {
      setBackendAlerts([])
      setLoading(false)
      return
    }
    const controller = new AbortController()
    let cancelled = false

    async function load() {
      try {
        const resp = await fetch(`${API_BASE}/alerts?per_page=20`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        if (!resp.ok) { if (!cancelled) setBackendAlerts([]); return }
        const payload = await resp.json()
        const list = Array.isArray(payload?.data) ? payload.data : []
        if (cancelled) return
        setBackendAlerts(list.map((a) => ({
          id: `srv:${a.id}`,
          color: severityToColor(a.severity),
          text: a.title || a.source || 'Alerta del sistema',
          actionLabel: null,
          actionUrl: null,
          canDismiss: true,
        })))
      } catch {
        if (!cancelled) setBackendAlerts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true; controller.abort() }
  }, [token])

  const dismiss = useCallback((id) => {
    setDismissed((prev) => { const next = new Set(prev); next.add(id); return next })
  }, [])

  const clockIn = useCallback(() => {
    // Simulación: la API real todavía no existe; marcamos fichado con la hora actual.
    setClockedInAt(new Date())
    // Si el usuario había descartado la alerta de fichado-ok previamente, permite verla de nuevo.
    setDismissed((prev) => {
      const next = new Set(prev)
      next.delete('local:fichado')
      return next
    })
  }, [])

  const synthetic = useMemo(() => {
    const items = []
    if (!clockedInAt) {
      items.push({
        id: 'local:no-fichado',
        color: 'amber',
        text: 'No has fichado hoy',
        actionLabel: 'Fichar',
        actionKind: 'clockIn',
        canDismiss: true,
      })
    } else {
      items.push({
        id: 'local:fichado',
        color: 'green',
        text: `Fichado a las ${formatHHMM(clockedInAt)}`,
        actionLabel: null,
        canDismiss: true,
      })
    }
    if (!profileComplete) {
      items.push({
        id: 'local:profile-missing',
        color: 'blue',
        text: 'Completa los datos básicos de tu perfil',
        actionLabel: 'Ir al perfil',
        actionUrl: '/profile',
        canDismiss: true,
      })
    }
    return items
  }, [clockedInAt, profileComplete])

  const alerts = useMemo(() => {
    return [...synthetic, ...backendAlerts].filter((a) => !dismissed.has(a.id))
  }, [synthetic, backendAlerts, dismissed])

  return { alerts, loading, dismiss, clockIn }
}
