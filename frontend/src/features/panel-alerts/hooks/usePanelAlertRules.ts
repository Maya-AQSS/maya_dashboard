import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPanelAlertRule,
  deletePanelAlertRule,
  listPanelAlertRules,
  updatePanelAlertRule,
} from '../api/panelAlertRulesApi'
import type {
  CreatePanelAlertRuleInput,
  PaginatedPanelAlertRules,
  UpdatePanelAlertRuleInput,
} from '../types/panelAlert'

type UsePanelAlertRulesOptions = {
  enabled?: boolean
}

export function usePanelAlertRules(options: UsePanelAlertRulesOptions = {}) {
  const queryClient = useQueryClient()
  const enabled = options.enabled ?? true

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['panel-alert-rules'] }),
    [queryClient],
  )

  const query = useQuery<PaginatedPanelAlertRules, Error>({
    queryKey: ['panel-alert-rules'],
    queryFn: () => listPanelAlertRules(),
    enabled,
    retry: 1,
    staleTime: 60_000,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePanelAlertRuleInput) => createPanelAlertRule(data),
    onSuccess: () => refresh(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePanelAlertRuleInput }) =>
      updatePanelAlertRule(id, data),
    onSuccess: () => refresh(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePanelAlertRule(id),
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
