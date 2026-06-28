import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createNotificationRule,
  deleteNotificationRule,
  listNotificationRules,
  updateNotificationRule,
} from '../api/notificationRulesApi'
import type {
  CreateNotificationRuleInput,
  PaginatedNotificationRules,
  UpdateNotificationRuleInput,
} from '../types/notificationRule'

export function useNotificationRules(options: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient()
  const enabled = options.enabled ?? true

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['notification-rules'] }),
    [queryClient],
  )

  const query = useQuery<PaginatedNotificationRules, Error>({
    queryKey: ['notification-rules'],
    queryFn: () => listNotificationRules(),
    enabled,
    retry: 1,
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateNotificationRuleInput) => createNotificationRule(data),
    onSuccess: () => refresh(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateNotificationRuleInput }) => updateNotificationRule(id, data),
    onSuccess: () => refresh(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNotificationRule(id),
    onSuccess: () => refresh(),
  })

  return {
    rules: query.data?.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    onCreate: createMutation.mutateAsync,
    onUpdate: updateMutation.mutateAsync,
    onDelete: deleteMutation.mutateAsync,
    refresh,
  }
}
