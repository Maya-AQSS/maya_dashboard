import { apiFetch, mapApiError } from '../../../api/fetchClient'

async function getDashboardLayout(userId: string, token: string | null) {
  if (!userId || !token) throw new Error('dashboardLayout.errorLoad')

  try {
    const response = await apiFetch(
      `/dashboard/user/${encodeURIComponent(userId)}/dashboard-layout`,
      { token },
    )
    return response.json()
  } catch (err) {
    throw mapApiError(err, 'dashboardLayout')
  }
}

async function updateDashboardLayout(userId: string, layout: unknown, token: string | null) {
  if (!userId || !token) throw new Error('dashboardLayout.errorSave')

  try {
    const response = await apiFetch(
      `/dashboard/user/${encodeURIComponent(userId)}/dashboard-layout`,
      { method: 'PUT', token, body: { layout } },
    )
    return response.json()
  } catch (err) {
    throw mapApiError(err, 'dashboardLayout', 'errorSave')
  }
}

export { getDashboardLayout, updateDashboardLayout }
