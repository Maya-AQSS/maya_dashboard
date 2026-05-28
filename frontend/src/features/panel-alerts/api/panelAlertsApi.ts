import { apiGetJson, apiFetchJson } from '../../../api/http'
import type {
  CreatePanelAlertInput,
  PaginatedPanelAlerts,
  PanelAlert,
  PanelAlertFilters,
  UpdatePanelAlertInput,
} from '../types/panelAlert'

interface FlatPaginatedResponse {
  data: PanelAlert[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export async function listPanelAlerts(filters: PanelAlertFilters = {}): Promise<PaginatedPanelAlerts> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.per_page) params.set('per_page', String(filters.per_page))
  if (filters.severity) params.set('severity', filters.severity)
  if (filters.search) params.set('search', filters.search)
  if (filters.include_expired) params.set('include_expired', '1')
  if (filters.sort_by) params.set('sort_by', filters.sort_by)
  if (filters.sort_dir) params.set('sort_dir', filters.sort_dir)
  const qs = params.toString()
  const raw = await apiGetJson<FlatPaginatedResponse>(`/panel-alerts?${qs}`)
  return {
    data: raw.data,
    meta: {
      current_page: raw.current_page,
      last_page: raw.last_page,
      per_page: raw.per_page,
      total: raw.total,
      from: raw.from,
      to: raw.to,
    },
  }
}

export async function getActivePanelAlerts(): Promise<PanelAlert[]> {
  const raw = await apiGetJson<{ data: { alerts: PanelAlert[] } }>('/panel-alerts/active')
  return raw.data?.alerts ?? []
}

export async function createPanelAlert(data: CreatePanelAlertInput): Promise<PanelAlert> {
  const raw = await apiFetchJson<{ data: PanelAlert }>('/panel-alerts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return raw.data
}

export async function updatePanelAlert(id: number, data: UpdatePanelAlertInput): Promise<PanelAlert> {
  const raw = await apiFetchJson<{ data: PanelAlert }>(`/panel-alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return raw.data
}

export async function deletePanelAlert(id: number): Promise<void> {
  await apiFetchJson(`/panel-alerts/${id}`, { method: 'DELETE' })
}
