import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPanelAlert,
  deletePanelAlert,
  listPanelAlerts,
  updatePanelAlert,
} from '../api/panelAlertsApi'
import type {
  CreatePanelAlertInput,
  PaginatedPanelAlerts,
  PanelAlertFilters,
  UpdatePanelAlertInput,
} from '../types/panelAlert'

/**
 * @deprecated Replaced by useCriticalAlerts() — eliminate after verifying callers.
 */
export function usePanelAlerts(filters: PanelAlertFilters = {}) {
  const queryClient = useQueryClient()
  const queryKey = ['panel-alerts', filters] as const

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['panel-alerts'] }),
    [queryClient],
  )

  const query = useQuery<PaginatedPanelAlerts, Error>({
    queryKey,
    queryFn: () => listPanelAlerts(filters),
    retry: 1,
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePanelAlertInput) => createPanelAlert(data),
    onSuccess: () => refresh(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePanelAlertInput }) =>
      updatePanelAlert(id, data),
    onSuccess: () => refresh(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePanelAlert(id),
    onSuccess: () => refresh(),
  })

  return {
    alerts: query.data?.data ?? [],
    meta: query.data?.meta ?? null,
    loading: query.isPending,
    error: query.error?.message ?? null,
    onCreate: createMutation.mutateAsync,
    onUpdate: updateMutation.mutateAsync,
    onDelete: deleteMutation.mutateAsync,
    refresh,
  }
}
