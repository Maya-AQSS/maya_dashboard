import { apiFetchJson } from '../../../api/http'

/**
 * QA: fires a sample notification of the given type to the current user, so an
 * admin can preview it in the bell/inbox. Goes through the normal ingestion
 * (gate + i18n + severity + url).
 */
export async function fireNotificationSample(key: string): Promise<boolean> {
  const res = await apiFetchJson<{ data: { delivered: boolean } }>('/notifications/fire-sample', {
    method: 'POST',
    body: { key },
  })
  return res.data.delivered
}
