import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import { getApplicationsData } from '../api/applicationsApi'
import { useFavoritesContext } from '../../favorites/context/FavoritesContext'

function useApplicationsData() {
  const { user, token } = useAuth()
  const { t } = useLocale()
  const { favorites, add, remove } = useFavoritesContext()

  const { data: rawApps = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['applications', user?.sub],
    queryFn: async () => {
      const res = await getApplicationsData(user!.sub, token!)
      return res.applications ?? []
    },
    enabled: !!user?.sub && !!token,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  const error = queryError
    ? (queryError instanceof Error ? queryError.message : t('applications.errorLoad'))
    : null

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
