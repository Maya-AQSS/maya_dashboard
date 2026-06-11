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
    const qs = new URLSearchParams()
    if (params.page) qs.set('page', String(params.page))
    if (params.per_page) qs.set('per_page', String(params.per_page))
    if (params.search) qs.set('search', params.search)
    if (params.favorite) qs.set('favorite', params.favorite)
    if (params.sort_by) qs.set('sort_by', params.sort_by)
    if (params.sort_dir) qs.set('sort_dir', params.sort_dir)

    const url = `/dashboard/user/${encodeURIComponent(userId)}/applications${qs.toString() ? `?${qs.toString()}` : ''}`
    const payload = await apiGetJson<ApplicationsPayload>(url)
    const apps = Array.isArray(payload?.data) ? payload.data : []
    return { data: apps.map(mapApplicationFromApi), meta: payload?.meta }
  } catch (err) {
    throw mapApiError(err, 'applications')
  }
}

export { getApplicationsData, listApplications }
export type { ListApplicationsParams }
