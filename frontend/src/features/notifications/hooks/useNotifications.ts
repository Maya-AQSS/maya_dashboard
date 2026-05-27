import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notificationsApi'
import type { NotificationListFilters, PaginatedNotifications, PaginationMeta } from '../types/notification'

const POLL_MS = 60_000

export function useNotifications(filters: NotificationListFilters = {}) {
  const queryClient = useQueryClient()
  const queryKey = ['notifications', filters] as const

  const query = useQuery<PaginatedNotifications, Error>({
    queryKey,
    queryFn: () => listNotifications(filters),
    refetchInterval: POLL_MS,
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

  const meta: PaginationMeta | null = query.data?.meta ?? null

  return {
    notifications: query.data?.data ?? [],
    meta,
    loading: query.isPending,
    error: query.error ? (query.error.message || 'notifications.errorLoad') : null,
    refresh,
    onMarkRead: markReadMutation.mutateAsync,
    onMarkAllRead: markAllReadMutation.mutateAsync,
  }
}
