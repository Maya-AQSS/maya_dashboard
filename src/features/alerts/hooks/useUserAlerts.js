// TODO: replace mock with GET /api/v1/alerts?userId=... when API is available
import { useState, useEffect } from 'react'

const MOCK_ALERTS = [
  {
    id: 1,
    color: 'amber',
    text: 'No has fichado hoy',
    actionLabel: 'Fichar',
    actionUrl: '/fichaje',
  },
  {
    id: 2,
    color: 'blue',
    text: 'Tienes 2 solicitudes de modificación pendientes de revisión',
    actionLabel: null,
    actionUrl: null,
  },
  {
    id: 3,
    color: 'red',
    text: 'Tu contrato expira en 30 días',
    actionLabel: 'Ver detalle',
    actionUrl: '/profile',
  },
]

export function useUserAlerts(userId) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const timer = setTimeout(() => {
      setAlerts(MOCK_ALERTS)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [userId])

  return { alerts, loading }
}
