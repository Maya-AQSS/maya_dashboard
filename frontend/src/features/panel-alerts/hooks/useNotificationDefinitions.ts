import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listNotificationDefinitions,
  setNotificationDefinitionEnabled,
} from '../api/notificationDefinitionsApi'
import type { DefinitionCategory, NotificationDefinition } from '../types/systemNotification'

type Options = {
  enabled?: boolean
  category?: DefinitionCategory
}

/**
 * Reads the system-notification catalog and toggles each type on/off.
 * Backs the "System notifications" tab of the Alerts page.
 */
export function useNotificationDefinitions(options: Options = {}) {
  const queryClient = useQueryClient()
  const enabled = options.enabled ?? true
  const queryKey = ['notification-definitions', options.category ?? 'all'] as const

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['notification-definitions'] }),
    [queryClient],
  )

  const query = useQuery({
    queryKey,
    queryFn: () => listNotificationDefinitions({ category: options.category }),
    enabled,
    retry: 1,
    staleTime: 30_000,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      setNotificationDefinitionEnabled(id, value),
    onSuccess: () => refresh(),
  })

  return {
    definitions: (query.data?.data ?? []) as NotificationDefinition[],
    loading: query.isPending,
    error: query.error?.message ?? null,
    onToggle: (id: number, value: boolean) => toggleMutation.mutateAsync({ id, value }),
    toggling: toggleMutation.isPending,
    refresh,
  }
}
