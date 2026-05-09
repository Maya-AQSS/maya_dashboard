import { apiFetch, mapApiError } from '../../../api/fetchClient'
import { mapApplicationFromApi } from './applicationMapper'

async function getApplicationsData(userId: string, token: string | null) {
  if (!userId) throw new Error('applications.errorLoad')

  try {
    const response = await apiFetch(
      `/dashboard/user/${encodeURIComponent(userId)}/applications`,
      { token },
    )
    const payload = await response.json()
    const apps = Array.isArray(payload?.data) ? payload.data : []
    return { applications: apps.map(mapApplicationFromApi) }
  } catch (err) {
    throw mapApiError(err, 'applications')
  }
}

export { getApplicationsData }
