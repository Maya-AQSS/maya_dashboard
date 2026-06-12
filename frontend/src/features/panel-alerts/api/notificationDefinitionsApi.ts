import { buildQueryString } from '@ceedcv-maya/shared-auth-react'
import { apiGetJson, apiFetchJson } from '../../../api/http'
import type { DefinitionCategory, NotificationDefinition } from '../types/systemNotification'

interface EnvelopedList {
  data: NotificationDefinition[]
}

interface EnvelopedItem {
  data: NotificationDefinition
}

interface PaginatedResponse {
  data: NotificationDefinition[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface ListFilters {
  category?: DefinitionCategory
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

interface ListResult {
  data: NotificationDefinition[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function listNotificationDefinitions(filters: ListFilters): Promise<ListResult> {
  const qs = buildQueryString({
    category: filters.category,
    page: filters.page,
    per_page: filters.per_page,
    search: filters.search,
    sort_by: filters.sort_by,
    sort_dir: filters.sort_dir,
  })
  const url = `/notification-definitions${qs}`
  const res = await apiGetJson<PaginatedResponse>(url)
  return {
    data: res.data,
    meta: {
      current_page: res.current_page,
      last_page: res.last_page,
      per_page: res.per_page,
      total: res.total,
    },
  }
}

export async function setNotificationDefinitionEnabled(
  id: number,
  enabled: boolean,
): Promise<NotificationDefinition> {
  const res = await apiFetchJson<EnvelopedItem>(`/notification-definitions/${id}`, {
    method: 'PUT',
    body: { enabled },
  })
  return res.data
}
