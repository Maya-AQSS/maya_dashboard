import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import { getToolsData } from '../api/toolsApi'
import { useFavoritesContext } from '../../favorites/context/FavoritesContext'

function resolveToolsErrorMessage(err, fallbackKey, t) {
  const msg = err?.message ?? ''
  if (msg.startsWith('tools.')) return t(msg)
  if (msg) return msg
  return t(fallbackKey)
}

function useToolsData() {
  const { user } = useAuth()
  const { t } = useLocale()
  const { add: addToSidebar, remove: removeFromSidebar } = useFavoritesContext()
  const tRef = useRef(t)
  tRef.current = t

  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.sub) {
      setTools([])
      setLoading(false)
      return
    }

    let isMounted = true

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await getToolsData(user.sub)

        if (isMounted) {
          const toolsFromApi = response.tools || []
          setTools(toolsFromApi)
        }
      } catch (err) {
        if (isMounted) {
          setError(resolveToolsErrorMessage(err, 'tools.errorLoad', tRef.current))
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

  const toggleFavorite = useCallback(
    async (id) => {
      const current = tools.find((tool) => tool.id === id)
      if (!current) return

      const wasFavorite = current.isFavorite

      // Optimistic update of the tools grid
      setTools((prev) =>
        prev.map((tool) =>
          tool.id === id ? { ...tool, isFavorite: !wasFavorite } : tool,
        ),
      )

      try {
        // Delegate to FavoritesContext so the sidebar updates in sync
        if (wasFavorite) {
          await removeFromSidebar(id)
        } else {
          await addToSidebar(id)
        }
      } catch {
        // Rollback tools grid on failure (sidebar handles its own rollback)
        setTools((prev) =>
          prev.map((tool) =>
            tool.id === id ? { ...tool, isFavorite: wasFavorite } : tool,
          ),
        )
      }
    },
    [tools, addToSidebar, removeFromSidebar],
  )

  return { tools, loading, error, toggleFavorite }
}

export default useToolsData
