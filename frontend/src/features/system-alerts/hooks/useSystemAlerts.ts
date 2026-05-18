import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { acknowledgeAlert, listSystemAlerts, resolveAlert } from '../api/systemAlertsApi'

const POLL_MS = 60_000

interface UseSystemAlertsOptions {
  token?: string
  activeOnly?: boolean
  severity?: string
}

interface SystemAlertsPage {
  data?: unknown[]
}

export function useSystemAlerts({
  token,
  activeOnly = true,
  severity,
}: UseSystemAlertsOptions = {}) {
  const queryClient = useQueryClient()
  const queryKey = ['system-alerts', { activeOnly, severity }] as const

  const query = useQuery<SystemAlertsPage, Error>({
    queryKey,
    queryFn: () =>
      listSystemAlerts({ token, activeOnly, severity }) as Promise<SystemAlertsPage>,
    enabled: !!token,
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: false,
    retry: 1,
  })

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey }),
    [queryClient, queryKey],
  )

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string | number) => acknowledgeAlert({ token, id }),
    onSuccess: () => refresh(),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string | number) => resolveAlert({ token, id }),
    onSuccess: () => refresh(),
  })

  return {
    alerts: query.data?.data ?? [],
    loading: query.isPending && !!token,
    error: query.error ? query.error.message || 'alerts.errorLoad' : null,
    refresh,
    onAcknowledge: acknowledgeMutation.mutateAsync,
    onResolve: resolveMutation.mutateAsync,
  }
}
