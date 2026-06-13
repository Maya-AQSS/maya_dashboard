import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { canAccessByViewPermission } from '@ceedcv-maya/shared-profile-react'
import { listApplications } from '../api/applicationsApi'
import { useFavoritesContext } from '../../favorites/context/FavoritesContext'
import { useUserProfile } from '../../user-profile'

function useApplicationsData() {
  const { user, token } = useAuth()
  const { t } = useLocale()
  const { favorites, add, remove } = useFavoritesContext()
  const { hasPermission } = useUserProfile()

  const { data: rawApps = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['applications', user?.sub],
    queryFn: async () => {
      const res = await listApplications(user!.sub)
      return res.data ?? []
    },
    enabled: !!user?.sub && !!token,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  const error = queryError
    ? (queryError instanceof Error ? queryError.message : t('applications.errorLoad'))
    : null

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites])

  const apps = useMemo(() => {
    const accessible = rawApps.filter((app) =>
      canAccessByViewPermission(app.viewPermissionSlug, hasPermission),
    )

    return accessible.map((app) => ({
      ...app,
      isFavorite: favoriteIds.has(app.id),
    }))
  }, [rawApps, favoriteIds, hasPermission])

  const toggleFavorite = useCallback(
    (id: string | number) => {
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
