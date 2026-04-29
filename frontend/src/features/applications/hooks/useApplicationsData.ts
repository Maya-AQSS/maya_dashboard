import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import { getToolsData } from '../../tools/api/toolsApi'
import { useFavoritesContext } from '../../favorites/context/FavoritesContext'

function resolveErrorMessage(err, fallbackKey, t) {
  const msg = err?.message ?? ''
  if (msg.startsWith('applications.') || msg.startsWith('tools.') || msg.startsWith('favorites.')) return t(msg)
  if (msg) return msg
  return t(fallbackKey)
}

function useApplicationsData() {
  const { user, token } = useAuth()
  const { t } = useLocale()
  const tRef = useRef(t)
  tRef.current = t

  const { favorites, add, remove } = useFavoritesContext()

  const [rawApps, setRawApps] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.sub) {
      setRawApps([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const appsResponse = await getToolsData(user.sub, token)

        if (isMounted) {
          setRawApps(appsResponse.tools || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(resolveErrorMessage(err, 'applications.errorLoad', tRef.current))
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
  }, [user?.sub])

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites])

  const apps = useMemo(
    () => rawApps.map((app) => ({ ...app, isFavorite: favoriteIds.has(app.id) })),
    [rawApps, favoriteIds],
  )

  const toggleFavorite = useCallback(
    (id) => {
      if (favoriteIds.has(id)) {
        remove(id)
      } else {
        add(id)
      }
    },
    [favoriteIds, add, remove],
  )

  return { apps, loading, error, toggleFavorite }
}

export default useApplicationsData
