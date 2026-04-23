import { useCallback, useEffect, useState } from 'react'
import { acknowledgeAlert, listSystemAlerts, resolveAlert } from '../api/systemAlertsApi'

const POLL_MS = 60_000

export function useSystemAlerts({ token, activeOnly = true, severity } = {}) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!token) return
    try {
      const page = await listSystemAlerts({ token, activeOnly, severity })
      setAlerts(page?.data ?? [])
      setError(null)
    } catch (e) {
      setError(e.message || 'alerts.errorLoad')
    } finally {
      setLoading(false)
    }
  }, [token, activeOnly, severity])

  useEffect(() => {
    refresh()
    if (!token) return
    const interval = setInterval(refresh, POLL_MS)
    return () => clearInterval(interval)
  }, [refresh, token])

  const onAcknowledge = useCallback(
    async (id) => {
      await acknowledgeAlert({ token, id })
      await refresh()
    },
    [token, refresh],
  )

  const onResolve = useCallback(
    async (id) => {
      await resolveAlert({ token, id })
      await refresh()
    },
    [token, refresh],
  )

  return { alerts, loading, error, refresh, onAcknowledge, onResolve }
}
