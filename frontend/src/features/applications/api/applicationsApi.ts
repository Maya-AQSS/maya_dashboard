import { apiGetJson, mapApiError } from '../../../api/http'
import { mapApplicationFromApi } from './applicationMapper'

interface ApplicationsPayload {
  data?: unknown[]
}

async function getApplicationsData(userId: string, _token?: string | null) {
  if (!userId) throw new Error('applications.errorLoad')

  try {
    const payload = await apiGetJson<ApplicationsPayload>(
      `/dashboard/user/${encodeURIComponent(userId)}/applications`,
    )
    const apps = Array.isArray(payload?.data) ? payload.data : []
    return { applications: apps.map(mapApplicationFromApi) }
  } catch (err) {
    throw mapApiError(err, 'applications')
  }
}

export { getApplicationsData }
