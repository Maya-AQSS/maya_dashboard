import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { notifyFavoritesChanged } from '@maya/shared-sidebar-react'
import { getFavorites, addFavorite, removeFavorite } from '../api/favoritesApi'

interface Favorite {
  id: string | number
  name?: string
  [key: string]: unknown
}

interface FavoritesContextValue {
  favorites: Favorite[]
  loading: boolean
  error: string | null
  add: (applicationId: string | number) => Promise<void>
  remove: (applicationId: string | number) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.sub || !token) {
      setFavorites([])
      setLoading(false)
      return
    }
    let isMounted = true
    setLoading(true)
    setError(null)
    getFavorites(user.sub, token)
      .then((data) => { if (isMounted) setFavorites(data as Favorite[]) })
      .catch((err: unknown) => {
        if (isMounted) {
          setFavorites([])
          setError((err as Error)?.message ?? 'favorites.errorLoad')
        }
      })
      .finally(() => { if (isMounted) setLoading(false) })
    return () => { isMounted = false }
  }, [user?.sub, token])

  const add = useCallback(async (applicationId: string | number) => {
    if (!user?.sub || !token) return
    setFavorites((prev) =>
      prev.some((f) => f.id === applicationId) ? prev : [...prev, { id: applicationId }],
    )
    try {
      const added = await addFavorite(user.sub, applicationId, token)
      setFavorites((prev) => prev.map((f) => (f.id === applicationId ? (added as Favorite) : f)))
      notifyFavoritesChanged()
    } catch {
      setFavorites((prev) => prev.filter((f) => f.id !== applicationId))
    }
  }, [user?.sub, token])

  const remove = useCallback(async (applicationId: string | number) => {
    if (!user?.sub || !token) return
    let removed: Favorite | null = null
    setFavorites((prev) => {
      removed = prev.find((f) => f.id === applicationId) ?? null
      return prev.filter((f) => f.id !== applicationId)
    })
    try {
      await removeFavorite(user.sub, applicationId, token)
      notifyFavoritesChanged()
    } catch {
      if (removed) setFavorites((prev) => [...prev, removed as Favorite])
    }
  }, [user?.sub, token])

  return (
    <FavoritesContext.Provider value={{ favorites, loading, error, add, remove }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavoritesContext(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavoritesContext must be inside FavoritesProvider')
  return ctx
}
