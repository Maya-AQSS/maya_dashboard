import { apiFetchJson, mapApiError } from '../../../api/http'

interface ClockInResponse {
  id: string
  user_id: string
  check_in: string
  check_out: string | null
  source: string | null
}

/**
 * Registra un check-in para el usuario con timestamp = ahora (server-side).
 * `source` permite distinguir el origen ('manual', 'kiosk', 'mobile', …).
 */
export async function postClockIn(
  userId: string,
  source: string = 'manual',
): Promise<ClockInResponse> {
  if (!userId) throw new Error('dashboard.fichaje.errorLoad')

  try {
    return await apiFetchJson<ClockInResponse>(
      `/dashboard/user/${encodeURIComponent(userId)}/attendances`,
      { method: 'POST', body: { source } },
    )
  } catch (err) {
    throw mapApiError(err, 'dashboard.fichaje')
  }
}
