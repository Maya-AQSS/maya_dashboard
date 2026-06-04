import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteNotification, listNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notificationsApi'
import type { NotificationListFilters, PaginatedNotifications, PaginationMeta } from '../types/notification'

const POLL_MS = 60_000

export function useNotifications(
  filters: NotificationListFilters = {},
  options: { enabled?: boolean } = {},
) {
  const queryClient = useQueryClient()
  const queryKey = ['notifications', filters] as const
  const enabled = options.enabled ?? true

  const query = useQuery<PaginatedNotifications, Error>({
    queryKey,
    queryFn: () => listNotifications(filters),
    enabled,
    refetchInterval: enabled ? POLL_MS : false,
    refetchIntervalInBackground: false,
    retry: 1,
  })

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    [queryClient],
  )

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => refresh(),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => refresh(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => refresh(),
  })

  const meta: PaginationMeta | null = query.data?.meta ?? null

  return {
    notifications: query.data?.data ?? [],
    meta,
    loading: query.isPending,
    error: query.error ? (query.error.message || 'notifications.errorLoad') : null,
    refresh,
    onMarkRead: markReadMutation.mutateAsync,
    onMarkAllRead: markAllReadMutation.mutateAsync,
    onDelete: deleteMutation.mutateAsync,
  }
}
