import { apiFetchJson, mapApiError } from '../../../api/http'

interface ClockInResponse {
  id: string
  user_id: string
  check_in: string
  check_out: string | null
  source: string | null
}

/**
 * Registra la entrada del usuario con la hora de ahora: el backend la registra en Odoo con el
 * endpoint de maya_attendance (D21), que pone la hora.
 * `source` es el origen que se guarda como terminal del fichaje; sin él, el backend usa el del
 * dashboard ('dashboard').
 */
export async function postClockIn(
  userId: string,
  source?: string,
): Promise<ClockInResponse> {
  if (!userId) throw new Error('dashboard.fichaje.errorLoad')

  try {
    return await apiFetchJson<ClockInResponse>(
      `/dashboard/user/${encodeURIComponent(userId)}/attendances`,
      { method: 'POST', body: source ? { source } : {} },
    )
  } catch (err) {
    throw mapApiError(err, 'dashboard.fichaje')
  }
}

/**
 * Registra la salida del usuario (cierra su entrada abierta de hoy) con la hora de ahora.
 * Devuelve el tramo cerrado. Lanza si hoy no hay ninguna entrada abierta.
 */
export async function postClockOut(userId: string): Promise<ClockInResponse> {
  if (!userId) throw new Error('dashboard.fichaje.errorLoad')

  try {
    return await apiFetchJson<ClockInResponse>(
      `/dashboard/user/${encodeURIComponent(userId)}/attendances/check-out`,
      { method: 'POST' },
    )
  } catch (err) {
    throw mapApiError(err, 'dashboard.fichaje')
  }
}
