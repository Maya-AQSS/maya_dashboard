import { apiFetchJson } from '../../../api/http'

/**
 * Login-triggered check: asks the dashboard to emit a "not clocked in today"
 * reminder notification if applicable. The server re-checks attendance and is
 * idempotent (one per user/day), so calling it speculatively is safe.
 */
export async function postAttendanceReminder(): Promise<void> {
  await apiFetchJson('/notifications/attendance-reminder', { method: 'POST' })
}
