import { useQuery } from '@tanstack/react-query'
import { getNotification } from '../api/notificationsApi'
import type { Notification } from '../types/notification'

export function useNotification(id: number | undefined) {
  return useQuery<Notification, Error>({
    queryKey: ['notification', id],
    queryFn: () => getNotification(id!),
    enabled: id != null,
    retry: 1,
  })
}
