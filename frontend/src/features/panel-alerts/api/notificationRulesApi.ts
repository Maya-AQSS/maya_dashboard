import { apiGetJson, apiFetchJson } from '../../../api/http'
import type {
  CreateNotificationRuleInput,
  NotificationRule,
  PaginatedNotificationRules,
  UpdateNotificationRuleInput,
} from '../types/notificationRule'

interface FlatPaginatedResponse {
  data: NotificationRule[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

interface ListFilters {
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

export async function listNotificationRules(filters?: ListFilters): Promise<PaginatedNotificationRules> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.per_page) params.append('per_page', String(filters.per_page))
  if (filters?.search) params.append('search', filters.search)
  if (filters?.sort_by) params.append('sort_by', filters.sort_by)
  if (filters?.sort_dir) params.append('sort_dir', filters.sort_dir)

  const qs = params.toString()
  const url = `/notification-rules${qs ? `?${qs}` : ''}`
  const raw = await apiGetJson<FlatPaginatedResponse>(url)
  return {
    data: raw.data,
    meta: {
      current_page: raw.current_page,
      last_page: raw.last_page,
      per_page: raw.per_page,
      total: raw.total,
      from: raw.from,
      to: raw.to,
    },
  }
}

export async function createNotificationRule(data: CreateNotificationRuleInput): Promise<NotificationRule> {
  const res = await apiFetchJson<{ data: NotificationRule }>('/notification-rules', {
    method: 'POST',
    body: data,
  })
  return res.data
}

export async function updateNotificationRule(id: number, data: UpdateNotificationRuleInput): Promise<NotificationRule> {
  const res = await apiFetchJson<{ data: NotificationRule }>(`/notification-rules/${id}`, {
    method: 'PUT',
    body: data,
  })
  return res.data
}

export async function deleteNotificationRule(id: number): Promise<void> {
  await apiFetchJson(`/notification-rules/${id}`, { method: 'DELETE' })
}
