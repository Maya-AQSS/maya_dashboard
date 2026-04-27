import { mapToolFromApi } from './toolMapper'

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
}

async function getToolsData(userId, token) {
  if (!userId) {
    throw new Error('tools.errorLoad')
  }

  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    throw new Error('tools.errorConfig')
  }

  const url = `${baseUrl}/dashboard/user/${encodeURIComponent(userId)}/applications`
  let response
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new Error('tools.errorNetwork')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    if (response.status === 401) throw new Error('tools.errorUnauthorized')
    if (response.status === 403) throw new Error('tools.errorForbidden')
    if (response.status >= 500) throw new Error('tools.errorServer')
    throw new Error('tools.errorLoad')
  }

  const payload = await response.json()
  const apps = Array.isArray(payload?.data) ? payload.data : []

  return {
    tools: apps.map(mapToolFromApi),
  }
}

export { getToolsData }
