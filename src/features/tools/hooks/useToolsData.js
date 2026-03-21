import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../../shared/i18n'
import { getToolsData, toggleToolFavorite } from '../api/toolsApi'

function resolveToolsErrorMessage(err, fallbackKey, t) {
  const msg = err?.message ?? ''
  if (msg.startsWith('tools.')) return t(msg)
  if (msg) return msg
  return t(fallbackKey)
}

function useToolsData() {
  const { t } = useLocale()
  const tRef = useRef(t)
  tRef.current = t

  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await getToolsData()

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
  }, [])

  const toggleFavorite = async (id) => {
    try {
      const updated = await toggleToolFavorite(id)

      setTools((prev) => {
        return prev.map((tool) =>
          tool.id === updated.id ? { ...tool, isFavorite: updated.isFavorite } : tool,
        )
      })
    } catch (err) {
      setError(resolveToolsErrorMessage(err, 'tools.errorToggleFavorite', tRef.current))
    }
  }

  return { tools, loading, error, toggleFavorite }
}

export default useToolsData
