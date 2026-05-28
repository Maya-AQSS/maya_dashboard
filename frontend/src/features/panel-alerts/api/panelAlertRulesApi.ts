import { apiGetJson, apiFetchJson } from '../../../api/http'
import type {
  CreatePanelAlertRuleInput,
  PaginatedPanelAlertRules,
  PanelAlertRule,
  UpdatePanelAlertRuleInput,
} from '../types/panelAlert'

interface FlatPaginatedResponse {
  data: PanelAlertRule[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export async function listPanelAlertRules(perPage = 100): Promise<PaginatedPanelAlertRules> {
  const raw = await apiGetJson<FlatPaginatedResponse>(`/panel-alert-rules?per_page=${perPage}`)
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

export async function createPanelAlertRule(data: CreatePanelAlertRuleInput): Promise<PanelAlertRule> {
  const raw = await apiFetchJson<{ data: PanelAlertRule }>('/panel-alert-rules', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return raw.data
}

export async function updatePanelAlertRule(id: number, data: UpdatePanelAlertRuleInput): Promise<PanelAlertRule> {
  const raw = await apiFetchJson<{ data: PanelAlertRule }>(`/panel-alert-rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return raw.data
}

export async function deletePanelAlertRule(id: number): Promise<void> {
  await apiFetchJson(`/panel-alert-rules/${id}`, { method: 'DELETE' })
}
