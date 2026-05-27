import { apiFetchJson, apiGetJson, mapApiError } from '../../../api/http'
import type { Notification, NotificationListFilters, PaginatedNotifications } from '../types/notification'

interface FlatPaginatedResponse {
  data: Notification[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export async function listNotifications(filters: NotificationListFilters = {}): Promise<PaginatedNotifications> {
  const qs = new URLSearchParams()
  if (filters.page != null) qs.set('page', String(filters.page))
  if (filters.per_page != null) qs.set('per_page', String(filters.per_page))
  if (filters.type) qs.set('type', filters.type)
  if (filters.app) qs.set('app', filters.app)
  if (filters.unread_only != null) qs.set('unread_only', filters.unread_only ? '1' : '0')
  if (filters.search) qs.set('search', filters.search)
  if (filters.date_from) qs.set('date_from', filters.date_from)
  if (filters.date_to) qs.set('date_to', filters.date_to)
  if (filters.sort_by) qs.set('sort_by', filters.sort_by)
  if (filters.sort_dir) qs.set('sort_dir', filters.sort_dir)

  try {
    const raw = await apiGetJson<FlatPaginatedResponse>(`/notifications?${qs}`)
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
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}

export async function getNotification(id: number): Promise<Notification> {
  try {
    const raw = await apiGetJson<{ data: Notification }>(`/notifications/${id}`)
    return raw.data
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}

export async function markNotificationRead(id: number): Promise<Notification> {
  try {
    const raw = await apiFetchJson<{ data: Notification }>(`/notifications/${id}/read`, { method: 'POST' })
    return raw.data
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  try {
    const raw = await apiFetchJson<{ data: { updated: number } }>('/notifications/mark-all-read', { method: 'POST' })
    return raw.data
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}

export async function getUnreadCount(): Promise<{ unread: number }> {
  try {
    const raw = await apiGetJson<{ data: { unread: number } }>('/notifications/unread-count')
    return raw.data
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}
