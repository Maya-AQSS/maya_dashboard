import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@maya/shared-auth-react'
import { apiFetch } from '../../../api/fetchClient'

type AlertColor = 'red' | 'amber' | 'blue' | 'green'

export interface AlertItem {
  id: string
  color: AlertColor
  text: string
  actionLabel: string | null
  actionUrl?: string
  actionKind?: string
  canDismiss: boolean
}

interface BackendAlert {
  id: number | string
  severity: string
  title?: string
  source?: string
}

function severityToColor(sev: string): AlertColor {
  if (sev === 'critical' || sev === 'high') return 'red'
  if (sev === 'medium') return 'amber'
  return 'blue'
}

async function fetchSystemAlerts(token: string): Promise<AlertItem[]> {
  const resp = await apiFetch('/alerts?per_page=20', { token })
  const payload = await resp.json() as { data?: BackendAlert[] }
  const list = Array.isArray(payload?.data) ? payload.data : []
  return list.map((a) => ({
    id: `srv:${a.id}`,
    color: severityToColor(a.severity),
    text: a.title ?? a.source ?? 'Alerta del sistema',
    actionLabel: null,
    canDismiss: true,
  }))
}

export function useSystemAlerts() {
  const { token, user } = useAuth()

  const { data: alerts = [], isPending: loading } = useQuery({
    queryKey: ['system-alerts', user?.sub],
    queryFn: () => fetchSystemAlerts(token!),
    enabled: !!token,
    staleTime: 60_000,
    retry: 1,
  })

  return { alerts, loading }
}
