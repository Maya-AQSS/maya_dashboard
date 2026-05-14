import { apiFetchJson, apiGetJson, mapApiError } from '../../../api/http'

interface FavoritePayload {
  data?: unknown
}

async function getFavorites(userId: string, _token?: string | null) {
  if (!userId) throw new Error('favorites.errorLoad')

  try {
    const payload = await apiGetJson<FavoritePayload | unknown[]>(
      `/dashboard/user/${encodeURIComponent(userId)}/favorites`,
    )
    return Array.isArray(payload) ? payload : ((payload as FavoritePayload)?.data ?? [])
  } catch (err) {
    throw mapApiError(err, 'favorites')
  }
}

async function addFavorite(userId: string, applicationId: string | number, _token?: string | null) {
  if (!userId || !applicationId) throw new Error('favorites.errorAdd')

  try {
    const payload = await apiFetchJson<FavoritePayload | unknown>(
      `/dashboard/user/${encodeURIComponent(userId)}/favorites`,
      { method: 'POST', body: { application_id: applicationId } },
    )
    return (payload as FavoritePayload)?.data ?? payload
  } catch (err) {
    throw mapApiError(err, 'favorites', 'errorAdd')
  }
}

async function removeFavorite(
  userId: string,
  applicationId: string | number,
  _token?: string | null,
) {
  if (!userId || !applicationId) throw new Error('favorites.errorRemove')

  try {
    await apiFetchJson(
      `/dashboard/user/${encodeURIComponent(userId)}/favorites/${encodeURIComponent(String(applicationId))}`,
      { method: 'DELETE' },
    )
  } catch (err) {
    throw mapApiError(err, 'favorites', 'errorRemove')
  }
}

export { getFavorites, addFavorite, removeFavorite }
