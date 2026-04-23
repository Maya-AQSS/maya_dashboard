function baseUrl() {
  return (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
}

async function request(path, { method = 'GET', token, body } = {}) {
  const url = `${baseUrl()}/api/v1/notifications${path}`
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
    throw new Error('notifications.errorNetwork')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    if (response.status === 401) throw new Error('notifications.errorUnauthorized')
    if (response.status === 403) throw new Error('notifications.errorForbidden')
    if (response.status >= 500) throw new Error('notifications.errorServer')
    throw new Error('notifications.errorLoad')
  }

  return response.status === 204 ? null : response.json()
}

export function listNotifications({ token, unreadOnly = false, perPage = 25 } = {}) {
  const qs = new URLSearchParams()
  if (unreadOnly) qs.set('unread_only', '1')
  qs.set('per_page', String(perPage))
  return request(`/?${qs}`, { token })
}

export function unreadCount({ token }) {
  return request('/unread-count', { token })
}

export function markAsRead({ token, id }) {
  return request(`/${id}/read`, { method: 'POST', token })
}

export function markAllAsRead({ token }) {
  return request('/mark-all-read', { method: 'POST', token })
}
