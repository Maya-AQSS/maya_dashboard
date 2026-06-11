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
  const params = new URLSearchParams()
  if (filters.category) params.append('category', filters.category)
  if (filters.page) params.append('page', String(filters.page))
  if (filters.per_page) params.append('per_page', String(filters.per_page))
  if (filters.search) params.append('search', filters.search)
  if (filters.sort_by) params.append('sort_by', filters.sort_by)
  if (filters.sort_dir) params.append('sort_dir', filters.sort_dir)

  const qs = params.toString()
  const url = `/notification-definitions${qs ? `?${qs}` : ''}`
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
