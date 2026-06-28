export type NotificationSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface Notification {
  id: number
  message_id: string | null
  app: string
  type: string
  recipient_id: string
  title: string
  body: string | null
  title_key: string | null
  body_key: string | null
  params: Record<string, unknown>
  severity: NotificationSeverity
  url: string | null
  target_app: string | null
  channels: string[]
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
  is_critical: boolean
  scope: 'user' | 'dashboard' | 'both' | null
  acknowledged_at: string | null
  acknowledged_by: string | null
  resolved_at: string | null
  resolved_by: string | null
}

export interface NotificationListFilters {
  page?: number
  per_page?: number
  type?: string
  app?: string
  unread_only?: boolean
  search?: string
  date_from?: string
  date_to?: string
  sort_by?: 'created_at' | 'read_at'
  sort_dir?: 'asc' | 'desc'
  scope?: 'user' | 'dashboard' | 'both'
  is_critical?: boolean
  acknowledged?: boolean
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface PaginatedNotifications {
  data: Notification[]
  meta: PaginationMeta
}
