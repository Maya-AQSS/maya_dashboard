import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '../../../shared/i18n'
import { getFavorites, addFavorite, removeFavorite } from '../api/favoritesApi'

function resolveFavoritesErrorMessage(err, fallbackKey, t) {
  const msg = err?.message ?? ''
  if (msg.startsWith('favorites.')) return t(msg)
  if (msg) return msg
  return t(fallbackKey)
}

function useFavorites() {
  const { user, token } = useAuth()
  const { t } = useLocale()
  const tRef = useRef(t)
  tRef.current = t

  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.sub || !token) {
      setFavorites([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const data = await getFavorites(user.sub, token)

        if (isMounted) {
          setFavorites(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(resolveFavoritesErrorMessage(err, 'favorites.errorLoad', tRef.current))
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

  const add = useCallback(async (applicationId) => {
    if (!user?.sub || !token) return

    try {
      const added = await addFavorite(user.sub, applicationId, token)
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === added.id)
        return exists ? prev : [...prev, added]
      })
    } catch (err) {
      setError(resolveFavoritesErrorMessage(err, 'favorites.errorAdd', tRef.current))
    }
  }, [user?.sub, token])

  const remove = useCallback(async (applicationId) => {
    if (!user?.sub || !token) return

    try {
      await removeFavorite(user.sub, applicationId, token)
      setFavorites((prev) => prev.filter((f) => f.id !== applicationId))
    } catch (err) {
      setError(resolveFavoritesErrorMessage(err, 'favorites.errorRemove', tRef.current))
    }
  }, [user?.sub, token])

  return { favorites, loading, error, add, remove }
}

export default useFavorites
