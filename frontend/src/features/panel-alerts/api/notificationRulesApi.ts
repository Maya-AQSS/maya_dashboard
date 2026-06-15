import { buildQueryString } from '@ceedcv-maya/shared-auth-react'
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
  source_app?: string
  severity?: string
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

export async function listNotificationRules(filters?: ListFilters): Promise<PaginatedNotificationRules> {
  const qs = buildQueryString({
    source_app: filters?.source_app,
    severity: filters?.severity,
    page: filters?.page,
    per_page: filters?.per_page,
    search: filters?.search,
    sort_by: filters?.sort_by,
    sort_dir: filters?.sort_dir,
  })
  const url = `/notification-rules${qs}`
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
