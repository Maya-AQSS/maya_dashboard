import { mapApplicationFromApi } from './applicationMapper'

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
}

async function getApplicationsData(userId, token) {
  if (!userId) {
    throw new Error('applications.errorLoad')
  }

  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    throw new Error('applications.errorConfig')
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
    throw new Error('applications.errorNetwork')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    if (response.status === 401) throw new Error('applications.errorUnauthorized')
    if (response.status === 403) throw new Error('applications.errorForbidden')
    if (response.status >= 500) throw new Error('applications.errorServer')
    throw new Error('applications.errorLoad')
  }

  const payload = await response.json()
  const apps = Array.isArray(payload?.data) ? payload.data : []

  return {
    applications: apps.map(mapApplicationFromApi),
  }
}

export { getApplicationsData }
