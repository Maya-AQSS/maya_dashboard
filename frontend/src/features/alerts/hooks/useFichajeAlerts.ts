import { useEffect, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { postClockIn } from '../../fichaje/api/clockInApi'
import { postAttendanceReminder } from '../api/attendanceReminderApi'
import useDailyFichajes from '../../fichaje/hooks/useDailyFichajes'
import type { AlertItem } from '../types/alertItem'

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
  const { t } = useLocale()
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

  // Recordatorio pasivo en login: si no has fichado hoy, pide al backend que
  // emita la notificación (campana/bandeja). El servidor re-valida y es
  // idempotente; el guard de sesión evita repetir en cada render del día.
  useEffect(() => {
    if (!userId || firstInToday) return
    const key = `attendance-reminder:${userId}:${todayKey}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    postAttendanceReminder().catch(() => sessionStorage.removeItem(key))
  }, [userId, firstInToday, todayKey])

  const alerts = useMemo<AlertItem[]>(() => {
    if (firstInToday) {
      // Confirmación verde — se puede descartar; el id incluye el día para
      // que descartar hoy no oculte la confirmación de mañana.
      return [{
        id: `local:fichado:${todayKey}`,
        color: 'green',
        text: t('dashboard.fichaje.clockedInAt', { time: formatHHMM(firstInToday) }),
        actionLabel: null,
        canDismiss: true,
      }]
    }
    // Aviso ámbar — NO se puede descartar: la única forma de hacerlo
    // desaparecer es fichar. Cada día es una alerta distinta vía el id.
    return [{
      id: `local:no-fichado:${todayKey}`,
      color: 'amber',
      text: t('dashboard.fichaje.notClockedIn'),
      actionLabel: mutation.isPending ? t('dashboard.fichaje.clockingIn') : t('dashboard.fichaje.clockInButton'),
      actionKind: 'clockIn',
      canDismiss: false,
    }]
  }, [firstInToday, mutation.isPending, todayKey, t])

  return { alerts, clockIn, clockInPending: mutation.isPending }
}
