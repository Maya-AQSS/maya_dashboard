import { buildQueryString } from '@ceedcv-maya/shared-auth-react'
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
  const qs = buildQueryString({
    page: filters.page,
    per_page: filters.per_page,
    severity: filters.severity,
    search: filters.search,
    include_expired: filters.include_expired,
    sort_by: filters.sort_by,
    sort_dir: filters.sort_dir,
  })
  const raw = await apiGetJson<FlatPaginatedResponse>(`/panel-alerts${qs}`)
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
    body: data,
  })
  return raw.data
}

export async function updatePanelAlert(id: number, data: UpdatePanelAlertInput): Promise<PanelAlert> {
  const raw = await apiFetchJson<{ data: PanelAlert }>(`/panel-alerts/${id}`, {
    method: 'PUT',
    body: data,
  })
  return raw.data
}

export async function deletePanelAlert(id: number): Promise<void> {
  await apiFetchJson(`/panel-alerts/${id}`, { method: 'DELETE' })
}
