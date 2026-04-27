function baseUrl() {
  return (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
}

async function request(path, { method = 'GET', token, body } = {}) {
  const url = `${baseUrl()}/alerts${path}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  let response
  try {
    response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('alerts.errorNetwork')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    if (response.status === 401) throw new Error('alerts.errorUnauthorized')
    if (response.status === 403) throw new Error('alerts.errorForbidden')
    if (response.status >= 500) throw new Error('alerts.errorServer')
    throw new Error('alerts.errorLoad')
  }
  return response.status === 204 ? null : response.json()
}

export function listSystemAlerts({ token, activeOnly = true, severity } = {}) {
  const qs = new URLSearchParams()
  qs.set('active_only', activeOnly ? '1' : '0')
  if (severity) qs.set('severity', severity)
  return request(`/?${qs}`, { token })
}

export function acknowledgeAlert({ token, id }) {
  return request(`/${id}/acknowledge`, { method: 'POST', token })
}

export function resolveAlert({ token, id }) {
  return request(`/${id}/resolve`, { method: 'POST', token })
}
