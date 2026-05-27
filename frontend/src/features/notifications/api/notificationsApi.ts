import { apiFetchJson, apiGetJson, mapApiError } from '../../../api/http'
import type { Notification, NotificationListFilters, PaginatedNotifications } from '../types/notification'

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
    return await apiGetJson<PaginatedNotifications>(`/notifications?${qs}`)
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}

export async function getNotification(id: number): Promise<Notification> {
  try {
    return await apiGetJson<Notification>(`/notifications/${id}`)
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}

export async function markNotificationRead(id: number): Promise<Notification> {
  try {
    return await apiFetchJson<Notification>(`/notifications/${id}/read`, { method: 'POST' })
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  try {
    return await apiFetchJson<{ updated: number }>('/notifications/mark-all-read', { method: 'POST' })
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}
