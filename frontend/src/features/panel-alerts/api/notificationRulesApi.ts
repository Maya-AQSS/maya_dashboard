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

export async function listNotificationRules(perPage = 50): Promise<PaginatedNotificationRules> {
  const raw = await apiGetJson<FlatPaginatedResponse>(`/notification-rules?per_page=${perPage}`)
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
