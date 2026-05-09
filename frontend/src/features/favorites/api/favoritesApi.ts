import { apiFetch, mapApiError } from '../../../api/fetchClient'

async function getFavorites(userId: string, token: string | null) {
  if (!userId || !token) throw new Error('favorites.errorLoad')

  try {
    const response = await apiFetch(`/dashboard/user/${encodeURIComponent(userId)}/favorites`, { token })
    const payload = await response.json()
    return Array.isArray(payload) ? payload : (payload?.data ?? [])
  } catch (err) {
    throw mapApiError(err, 'favorites')
  }
}

async function addFavorite(userId: string, applicationId: string | number, token: string | null) {
  if (!userId || !applicationId || !token) throw new Error('favorites.errorAdd')

  try {
    const response = await apiFetch(`/dashboard/user/${encodeURIComponent(userId)}/favorites`, {
      method: 'POST',
      token,
      body: { application_id: applicationId },
    })
    const payload = await response.json()
    return payload?.data ?? payload
  } catch (err) {
    throw mapApiError(err, 'favorites', 'errorAdd')
  }
}

async function removeFavorite(userId: string, applicationId: string | number, token: string | null) {
  if (!userId || !applicationId || !token) throw new Error('favorites.errorRemove')

  try {
    await apiFetch(
      `/dashboard/user/${encodeURIComponent(userId)}/favorites/${encodeURIComponent(String(applicationId))}`,
      { method: 'DELETE', token },
    )
  } catch (err) {
    throw mapApiError(err, 'favorites', 'errorRemove')
  }
}

export { getFavorites, addFavorite, removeFavorite }
