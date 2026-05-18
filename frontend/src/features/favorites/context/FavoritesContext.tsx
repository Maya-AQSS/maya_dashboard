import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createDataHook, createMutationHook, useAuth } from '@maya/shared-auth-react'
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

/**
 * Cache key común a query y mutations. Permite a las mutations leer/escribir
 * la lista en caché para hacer optimistic updates y rollbacks.
 */
const favoritesKey = (userId: string) => ['favorites', userId] as const

const useFavoritesQuery = createDataHook<
  { userId: string; token: string | null },
  Favorite[]
>({
  queryKey: ({ userId }) => favoritesKey(userId),
  fetcher: async ({ userId, token }) => {
    const data = await getFavorites(userId, token)
    return data as Favorite[]
  },
  defaultOptions: {
    staleTime: 30_000,
  },
})

const useAddFavoriteMutation = createMutationHook<
  { userId: string; applicationId: string | number; token: string | null },
  Favorite
>({
  mutationFn: async ({ userId, applicationId, token }) => {
    const added = await addFavorite(userId, applicationId, token)
    return added as Favorite
  },
})

const useRemoveFavoriteMutation = createMutationHook<
  { userId: string; applicationId: string | number; token: string | null },
  void
>({
  mutationFn: async ({ userId, applicationId, token }) => {
    await removeFavorite(userId, applicationId, token)
  },
})

/**
 * Provee favoritos del usuario via TanStack Query con optimistic updates
 * en add/remove. Reemplaza el patrón `useEffect + useState + fetch` previo.
 *
 * Optimismo:
 *  - add: añade `{id}` mínimo a la lista cacheada; al resolverse el POST,
 *    reemplaza esa entrada por el objeto completo del servidor.
 *  - remove: elimina la entrada; al fallar el DELETE, restaura.
 *  - Cualquier éxito dispara `notifyFavoritesChanged()` para sincronizar
 *    pestañas vía BroadcastChannel.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.sub ?? ''
  const enabled = !!userId && !!token

  const query = useFavoritesQuery(
    { userId, token: token ?? null },
    { enabled },
  )

  const addMutation = useAddFavoriteMutation()
  const removeMutation = useRemoveFavoriteMutation()

  const favorites = enabled ? (query.data ?? []) : []
  const loading = enabled ? query.isLoading : false
  const error = useMemo<string | null>(() => {
    if (!query.error) return null
    return query.error.message || 'favorites.errorLoad'
  }, [query.error])

  const add = useCallback(async (applicationId: string | number) => {
    if (!enabled) return

    const key = favoritesKey(userId)
    const previous = queryClient.getQueryData<Favorite[]>(key) ?? []

    if (previous.some((f) => f.id === applicationId)) return

    // Optimistic: añadir entrada mínima.
    queryClient.setQueryData<Favorite[]>(key, [...previous, { id: applicationId }])

    try {
      const added = await addMutation.mutateAsync({
        userId,
        applicationId,
        token: token ?? null,
      })
      queryClient.setQueryData<Favorite[]>(key, (current) =>
        (current ?? []).map((f) => (f.id === applicationId ? added : f)),
      )
      notifyFavoritesChanged()
    } catch {
      // Rollback: restaurar el estado previo.
      queryClient.setQueryData<Favorite[]>(key, previous)
    }
  }, [enabled, userId, token, queryClient, addMutation])

  const remove = useCallback(async (applicationId: string | number) => {
    if (!enabled) return

    const key = favoritesKey(userId)
    const previous = queryClient.getQueryData<Favorite[]>(key) ?? []
    const removed = previous.find((f) => f.id === applicationId) ?? null

    // Optimistic: quitar la entrada.
    queryClient.setQueryData<Favorite[]>(
      key,
      previous.filter((f) => f.id !== applicationId),
    )

    try {
      await removeMutation.mutateAsync({
        userId,
        applicationId,
        token: token ?? null,
      })
      notifyFavoritesChanged()
    } catch {
      // Rollback: re-añadir la entrada removida.
      if (removed) {
        queryClient.setQueryData<Favorite[]>(key, (current) =>
          [...(current ?? []), removed],
        )
      }
    }
  }, [enabled, userId, token, queryClient, removeMutation])

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
