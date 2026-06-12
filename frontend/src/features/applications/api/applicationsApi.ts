import { buildQueryString } from '@ceedcv-maya/shared-auth-react'
import { apiGetJson, mapApiError } from '../../../api/http'
import { mapApplicationFromApi } from './applicationMapper'

interface ApplicationsPayload {
  data?: unknown[]
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number
    to: number
  }
}

interface ListApplicationsParams {
  page?: number
  per_page?: number
  search?: string
  favorite?: 'yes' | 'no'
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

async function getApplicationsData(userId: string, _token?: string | null) {
  if (!userId) throw new Error('applications.errorLoad')

  try {
    const payload = await apiGetJson<ApplicationsPayload>(
      `/dashboard/user/${encodeURIComponent(userId)}/applications`,
    )
    const apps = Array.isArray(payload?.data) ? payload.data : []
    return { applications: apps.map(mapApplicationFromApi), meta: payload?.meta }
  } catch (err) {
    throw mapApiError(err, 'applications')
  }
}

async function listApplications(userId: string, params: ListApplicationsParams) {
  if (!userId) throw new Error('applications.errorLoad')

  try {
    const qs = buildQueryString({
      page: params.page,
      per_page: params.per_page,
      search: params.search,
      favorite: params.favorite,
      sort_by: params.sort_by,
      sort_dir: params.sort_dir,
    })

    const url = `/dashboard/user/${encodeURIComponent(userId)}/applications${qs}`
    const payload = await apiGetJson<ApplicationsPayload>(url)
    const apps = Array.isArray(payload?.data) ? payload.data : []
    return { data: apps.map(mapApplicationFromApi), meta: payload?.meta }
  } catch (err) {
    throw mapApiError(err, 'applications')
  }
}

export { getApplicationsData, listApplications }
export type { ListApplicationsParams }
