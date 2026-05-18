import { useCallback, useMemo, useRef } from 'react'
import { createDataHook, createMutationHook, useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import { getDashboardLayout, updateDashboardLayout } from '../api/dashboardLayoutApi'

interface DashboardLayoutResponse {
  layout?: unknown
}

type Translate = (key: string) => string

export const DEFAULT_LAYOUT = [
  { i: 'user-alerts', x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
  { i: 'fichaje-daily', x: 4, y: 0, w: 8, h: 3, minW: 4, minH: 2 },
]

/**
 * Cache key común a query y mutation. La mutation invalida esta key
 * tras un PUT exitoso, así el siguiente refetch lee del servidor.
 */
const dashboardLayoutKey = (userId: string) => ['dashboard-layout', userId] as const

const useDashboardLayoutQuery = createDataHook<
  { userId: string; token: string | null },
  DashboardLayoutResponse
>({
  queryKey: ({ userId }) => dashboardLayoutKey(userId),
  fetcher: ({ userId, token }) =>
    getDashboardLayout(userId, token) as Promise<DashboardLayoutResponse>,
  defaultOptions: {
    // El backend es la fuente de verdad; cada navegación recarga.
    staleTime: 0,
    refetchOnWindowFocus: false,
  },
})

const useUpdateDashboardLayoutMutation = createMutationHook<
  { userId: string; layout: unknown; token: string | null },
  DashboardLayoutResponse
>({
  mutationFn: ({ userId, layout, token }) =>
    updateDashboardLayout(userId, layout, token) as Promise<DashboardLayoutResponse>,
  invalidates: ({ userId }) => [dashboardLayoutKey(userId)],
})

function resolveDashboardLayoutErrorMessage(
  err: unknown,
  fallbackKey: string,
  t: Translate,
): string {
  const msg = err instanceof Error ? err.message : ''
  if (msg.startsWith('dashboardLayout.')) return t(msg)
  if (msg) return msg
  return t(fallbackKey)
}

/**
 * API pública del hook (preservada por compatibilidad con consumers
 * existentes): `{ layout, loading, error, saveLayout, resetToDefault }`.
 *
 * Internamente compone:
 *  - `useDashboardLayoutQuery` para GET (TanStack Query, caché 30s default).
 *  - `useUpdateDashboardLayoutMutation` para PUT (auto-invalida la key).
 *  - Mapping i18n de errores via `useLocale().t`.
 *
 * Reemplaza el `useEffect + useState + fetch` previo.
 */
function useDashboardLayout() {
  const { user, token } = useAuth()
  const { t } = useLocale()
  const tRef = useRef(t)
  tRef.current = t

  const userId = user?.sub ?? ''
  const enabled = !!userId && !!token

  const query = useDashboardLayoutQuery(
    { userId, token: token ?? null },
    { enabled },
  )

  const mutation = useUpdateDashboardLayoutMutation()

  const layout = useMemo(() => {
    if (!enabled) return DEFAULT_LAYOUT
    const saved = query.data?.layout
    return Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_LAYOUT
  }, [enabled, query.data])

  const error = useMemo(() => {
    const e = query.error ?? mutation.error
    if (!e) return null
    const fallbackKey = mutation.error ? 'dashboardLayout.errorSave' : 'dashboardLayout.errorLoad'
    return resolveDashboardLayoutErrorMessage(e, fallbackKey, tRef.current)
  }, [query.error, mutation.error])

  const saveLayout = useCallback(async (newLayout: unknown) => {
    if (!enabled) return
    try {
      await mutation.mutateAsync({ userId, layout: newLayout, token: token ?? null })
    } catch {
      // El error se expone via `error` memo arriba.
    }
  }, [enabled, mutation, userId, token])

  const resetToDefault = useCallback(async () => {
    if (!enabled) return
    try {
      await mutation.mutateAsync({ userId, layout: DEFAULT_LAYOUT, token: token ?? null })
    } catch {
      // El error se expone via `error` memo arriba.
    }
  }, [enabled, mutation, userId, token])

  return {
    layout,
    loading: enabled ? query.isLoading : false,
    error,
    saveLayout,
    resetToDefault,
  }
}

export default useDashboardLayout
