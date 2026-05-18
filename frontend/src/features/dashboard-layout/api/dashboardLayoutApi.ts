import { apiFetchJson, apiGetJson, mapApiError } from '../../../api/http'

async function getDashboardLayout(userId: string, _token?: string | null) {
  if (!userId) throw new Error('dashboardLayout.errorLoad')

  try {
    return await apiGetJson<unknown>(
      `/dashboard/user/${encodeURIComponent(userId)}/dashboard-layout`,
    )
  } catch (err) {
    throw mapApiError(err, 'dashboardLayout')
  }
}

async function updateDashboardLayout(
  userId: string,
  layout: unknown,
  _token?: string | null,
) {
  if (!userId) throw new Error('dashboardLayout.errorSave')

  try {
    return await apiFetchJson<unknown>(
      `/dashboard/user/${encodeURIComponent(userId)}/dashboard-layout`,
      { method: 'PUT', body: { layout } },
    )
  } catch (err) {
    throw mapApiError(err, 'dashboardLayout', 'errorSave')
  }
}

export { getDashboardLayout, updateDashboardLayout }
