function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
}

async function getFavorites(userId, token) {
  if (!userId || !token) {
    throw new Error('favorites.errorLoad')
  }

  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    throw new Error('favorites.errorConfig')
  }

  const url = `${baseUrl}/api/v1/dashboard/user/${encodeURIComponent(userId)}/favorites`
  let response
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
  } catch {
    throw new Error('favorites.errorNetwork')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    if (response.status === 401) throw new Error('favorites.errorUnauthorized')
    if (response.status === 403) throw new Error('favorites.errorForbidden')
    if (response.status >= 500) throw new Error('favorites.errorServer')
    throw new Error('favorites.errorLoad')
  }

  const payload = await response.json()
  return Array.isArray(payload) ? payload : (payload?.data ?? [])
}

async function addFavorite(userId, applicationId, token) {
  if (!userId || !applicationId || !token) {
    throw new Error('favorites.errorAdd')
  }

  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    throw new Error('favorites.errorConfig')
  }

  const url = `${baseUrl}/api/v1/dashboard/user/${encodeURIComponent(userId)}/favorites`
  let response
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ application_id: applicationId }),
    })
  } catch {
    throw new Error('favorites.errorNetwork')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    if (response.status === 401) throw new Error('favorites.errorUnauthorized')
    if (response.status === 403) throw new Error('favorites.errorForbidden')
    if (response.status >= 500) throw new Error('favorites.errorServer')
    throw new Error('favorites.errorAdd')
  }

  return await response.json()
}

async function removeFavorite(userId, applicationId, token) {
  if (!userId || !applicationId || !token) {
    throw new Error('favorites.errorRemove')
  }

  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    throw new Error('favorites.errorConfig')
  }

  const url = `${baseUrl}/api/v1/dashboard/user/${encodeURIComponent(userId)}/favorites/${encodeURIComponent(applicationId)}`
  let response
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    response = await fetch(url, {
      method: 'DELETE',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
  } catch {
    throw new Error('favorites.errorNetwork')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    if (response.status === 401) throw new Error('favorites.errorUnauthorized')
    if (response.status === 403) throw new Error('favorites.errorForbidden')
    if (response.status === 404) throw new Error('favorites.errorNotFound')
    if (response.status >= 500) throw new Error('favorites.errorServer')
    throw new Error('favorites.errorRemove')
  }
}

export { getFavorites, addFavorite, removeFavorite }
