export interface Notification {
  id: number
  message_id: string | null
  app: string
  type: string
  recipient_id: string
  title: string
  body: string | null
  channels: string[]
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
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
