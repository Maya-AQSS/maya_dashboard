import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { postClockIn } from '../../fichaje/api/clockInApi'
import useDailyFichajes from '../../fichaje/hooks/useDailyFichajes'
import type { AlertItem } from './useActiveSystemAlerts'

function formatHHMM(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

interface UseFichajeAlertsReturn {
  alerts: AlertItem[]
  clockIn: () => void
  clockInPending: boolean
}

/**
 * Combina el estado real del backend (fichajes de hoy) con una mutación POST
 * para registrar un nuevo check-in. La alerta refleja siempre la verdad
 * server-side: si el usuario ya tiene un check-in hoy, aparece "Fichado a las
 * HH:MM"; si no, aparece "No has fichado hoy" con el botón "Fichar".
 *
 * Al pulsar "Fichar" se invoca POST /attendances; tras éxito invalidamos las
 * queries `daily-fichajes` para forzar refetch y que la alerta cambie
 * automáticamente sin tocar estado local.
 */
export function useFichajeAlerts(): UseFichajeAlertsReturn {
  const { user } = useAuth()
  const userId = user?.sub
  const today = useMemo(() => startOfToday(), [])
  const todayKey = useMemo(() => toDateString(today), [today])

  const { entries } = useDailyFichajes(userId, today)
  const queryClient = useQueryClient()

  const firstInToday = useMemo(() => {
    const entry = entries.find((e) => e.type === 'in')
    if (!entry) return null
    const ts = entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp)
    return Number.isNaN(ts.getTime()) ? null : ts
  }, [entries])

  const mutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('dashboard.fichaje.errorLoad')
      return postClockIn(userId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['daily-fichajes', userId, todayKey] })
    },
  })

  const clockIn = (): void => {
    if (!userId || mutation.isPending || firstInToday) return
    mutation.mutate()
  }

  const alerts = useMemo<AlertItem[]>(() => {
    if (firstInToday) {
      // Confirmación verde — se puede descartar; el id incluye el día para
      // que descartar hoy no oculte la confirmación de mañana.
      return [{
        id: `local:fichado:${todayKey}`,
        color: 'green',
        text: `Fichado a las ${formatHHMM(firstInToday)}`,
        actionLabel: null,
        canDismiss: true,
      }]
    }
    // Aviso ámbar — NO se puede descartar: la única forma de hacerlo
    // desaparecer es fichar. Cada día es una alerta distinta vía el id.
    return [{
      id: `local:no-fichado:${todayKey}`,
      color: 'amber',
      text: 'No has fichado hoy',
      actionLabel: mutation.isPending ? 'Fichando…' : 'Fichar',
      actionKind: 'clockIn',
      canDismiss: false,
    }]
  }, [firstInToday, mutation.isPending, todayKey])

  return { alerts, clockIn, clockInPending: mutation.isPending }
}
