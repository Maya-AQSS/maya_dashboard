import { useCallback, useEffect, useState } from 'react'
import { listNotifications, markAllAsRead, markAsRead, unreadCount as fetchUnreadCount } from '../api/notificationsApi'

const POLL_MS = 30_000

export function useNotifications({ token } = {}) {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!token) return
    try {
      const [list, count] = await Promise.all([
        listNotifications({ token }),
        fetchUnreadCount({ token }),
      ])
      setNotifications(list?.data ?? [])
      setUnread(count?.unread ?? 0)
      setError(null)
    } catch (e) {
      setError(e.message || 'notifications.errorLoad')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    refresh()
    if (!token) return
    const interval = setInterval(refresh, POLL_MS)
    return () => clearInterval(interval)
  }, [refresh, token])

  const onMarkRead = useCallback(
    async (id) => {
      if (!token) return
      await markAsRead({ token, id })
      await refresh()
    },
    [token, refresh],
  )

  const onMarkAllRead = useCallback(async () => {
    if (!token) return
    await markAllAsRead({ token })
    await refresh()
  }, [token, refresh])

  return { notifications, unread, loading, error, refresh, onMarkRead, onMarkAllRead }
}
