import { useQuery } from '@tanstack/react-query'
import { getNotification } from '../api/notificationsApi'
import type { Notification } from '../types/notification'

export function useNotification(id: number | undefined) {
  return useQuery<Notification, Error>({
    queryKey: ['notification', id],
    queryFn: () => getNotification(id!),
    enabled: id != null && !Number.isNaN(id),
    staleTime: 60_000,
    retry: 1,
  })
}
