import { buildQueryString } from '@ceedcv-maya/shared-auth-react'
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
  // Los flags tri-estado (true/false/sin filtrar) se precomputan como '1'/'0':
  // buildQueryString omite `false`, pero aquí el '0' explícito filtra en el backend.
  const toFlag = (v: boolean | null | undefined) => (v == null ? undefined : v ? '1' : '0')
  const qs = buildQueryString({
    page: filters.page,
    per_page: filters.per_page,
    type: filters.type,
    app: filters.app,
    unread_only: toFlag(filters.unread_only),
    search: filters.search,
    date_from: filters.date_from,
    date_to: filters.date_to,
    sort_by: filters.sort_by,
    sort_dir: filters.sort_dir,
    scope: filters.scope,
    is_critical: toFlag(filters.is_critical),
    acknowledged: toFlag(filters.acknowledged),
  })

  try {
    const raw = await apiGetJson<FlatPaginatedResponse>(`/notifications${qs}`)
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

export async function acknowledgeNotification(id: number): Promise<void> {
  try {
    await apiFetchJson(`/notifications/${id}/acknowledge`, { method: 'POST' })
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}

export async function resolveNotification(id: number): Promise<void> {
  try {
    await apiFetchJson(`/notifications/${id}/resolve`, { method: 'POST' })
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}

export async function deleteNotification(id: number): Promise<void> {
  try {
    await apiFetchJson(`/notifications/${id}`, { method: 'DELETE' })
  } catch (err) {
    throw mapApiError(err, 'notifications')
  }
}
