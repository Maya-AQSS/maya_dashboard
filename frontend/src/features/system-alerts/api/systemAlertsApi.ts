import { apiFetchJson, apiGetJson, mapApiError } from '../../../api/http'

interface ListOptions {
  token?: string | null
  activeOnly?: boolean
  severity?: string
}

interface ActionOptions {
  token?: string | null
  id: string | number
}

export async function listSystemAlerts({ activeOnly = true, severity }: ListOptions = {}) {
  const qs = new URLSearchParams()
  qs.set('active_only', activeOnly ? '1' : '0')
  if (severity) qs.set('severity', severity)

  try {
    return await apiGetJson<unknown>(`/alerts?${qs}`)
  } catch (err) {
    throw mapApiError(err, 'alerts')
  }
}

export async function acknowledgeAlert({ id }: ActionOptions) {
  try {
    return await apiFetchJson<unknown>(`/alerts/${id}/acknowledge`, { method: 'POST' })
  } catch (err) {
    throw mapApiError(err, 'alerts')
  }
}

export async function resolveAlert({ id }: ActionOptions) {
  try {
    return await apiFetchJson<unknown>(`/alerts/${id}/resolve`, { method: 'POST' })
  } catch (err) {
    throw mapApiError(err, 'alerts')
  }
}
