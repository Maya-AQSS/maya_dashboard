import { useQuery } from '@tanstack/react-query'
import { getNotification } from '../api/notificationsApi'
import type { Notification } from '../types/notification'

export function useNotification(id: number | undefined, options: { enabled?: boolean } = {}) {
  const enabled = (options.enabled ?? true) && id != null && !Number.isNaN(id)

  return useQuery<Notification, Error>({
    queryKey: ['notification', id],
    queryFn: () => getNotification(id!),
    enabled,
    staleTime: 60_000,
    retry: 1,
  })
}
