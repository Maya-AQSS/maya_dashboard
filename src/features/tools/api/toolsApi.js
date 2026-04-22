import { mapToolFromApi } from './toolMapper'

function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
}

function getAppKey() {
  const appKey = import.meta.env.VITE_APP_KEY || ''

  if (import.meta.env.PROD && appKey.includes('changeme')) {
    throw new Error('tools.errorConfig')
  }

  return appKey
}

function mapAppsResponseToTools(payload) {
  const apps = Array.isArray(payload?.data) ? payload.data : []
  return apps.map(mapToolFromApi)
}

async function getToolsData(userId) {
  if (!userId) {
    throw new Error('tools.errorLoad')
  }

  const baseUrl = getApiBaseUrl()
  const appKey = getAppKey()

  if (!baseUrl || !appKey) {
    throw new Error('tools.errorConfig')
  }

  const url = `${baseUrl}/api/v1/auth/user/${encodeURIComponent(userId)}/apps`
  let response
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'X-App-Key': appKey,
      },
    })
  } catch {
    throw new Error('tools.errorNetwork')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('tools.errorUnauthorized')
    }
    if (response.status === 403) {
      throw new Error('tools.errorForbidden')
    }
    if (response.status >= 500) {
      throw new Error('tools.errorServer')
    }
    throw new Error('tools.errorLoad')
  }

  const payload = await response.json()

  return {
    tools: mapAppsResponseToTools(payload),
  }
}

export { getToolsData }
