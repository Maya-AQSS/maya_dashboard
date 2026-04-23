import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '../../../shared/i18n'
import { getDashboardLayout, updateDashboardLayout } from '../api/dashboardLayoutApi'

export const DEFAULT_LAYOUT = [
  { i: 'user-alerts', x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'fichaje-daily', x: 4, y: 0, w: 8, h: 3, minW: 4, minH: 2 },
]

function resolveDashboardLayoutErrorMessage(err, fallbackKey, t) {
  const msg = err?.message ?? ''
  if (msg.startsWith('dashboardLayout.')) return t(msg)
  if (msg) return msg
  return t(fallbackKey)
}

function useDashboardLayout() {
  const { user, token } = useAuth()
  const { t } = useLocale()
  const tRef = useRef(t)
  tRef.current = t

  const [layout, setLayout] = useState(DEFAULT_LAYOUT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.sub || !token) {
      setLayout(DEFAULT_LAYOUT)
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const data = await getDashboardLayout(user.sub, token)

        if (isMounted) {
          const saved = data.layout
          setLayout(Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_LAYOUT)
        }
      } catch (err) {
        if (isMounted) {
          setError(resolveDashboardLayoutErrorMessage(err, 'dashboardLayout.errorLoad', tRef.current))
          setLayout(DEFAULT_LAYOUT)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [user?.sub, token])

  const saveLayout = useCallback(async (newLayout) => {
    if (!user?.sub || !token) return

    setLayout(newLayout)

    try {
      const data = await updateDashboardLayout(user.sub, newLayout, token)
      setLayout(data.layout ?? newLayout)
    } catch (err) {
      setError(resolveDashboardLayoutErrorMessage(err, 'dashboardLayout.errorSave', tRef.current))
    }
  }, [user?.sub, token])

  const resetToDefault = useCallback(async () => {
    setLayout(DEFAULT_LAYOUT)

    if (!user?.sub || !token) return

    try {
      await updateDashboardLayout(user.sub, DEFAULT_LAYOUT, token)
    } catch (err) {
      setError(resolveDashboardLayoutErrorMessage(err, 'dashboardLayout.errorSave', tRef.current))
    }
  }, [user?.sub, token])

  return { layout, loading, error, saveLayout, resetToDefault }
}

export default useDashboardLayout
