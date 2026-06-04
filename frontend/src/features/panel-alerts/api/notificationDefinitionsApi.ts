import { apiGetJson, apiFetchJson } from '../../../api/http'
import type { DefinitionCategory, NotificationDefinition } from '../types/systemNotification'

interface EnvelopedList {
  data: NotificationDefinition[]
}

interface EnvelopedItem {
  data: NotificationDefinition
}

export async function listNotificationDefinitions(
  category?: DefinitionCategory,
): Promise<NotificationDefinition[]> {
  const qs = category ? `?category=${category}` : ''
  const res = await apiGetJson<EnvelopedList>(`/notification-definitions${qs}`)
  return res.data
}

export async function setNotificationDefinitionEnabled(
  id: number,
  enabled: boolean,
): Promise<NotificationDefinition> {
  const res = await apiFetchJson<EnvelopedItem>(`/notification-definitions/${id}`, {
    method: 'PUT',
    body: { enabled },
  })
  return res.data
}
