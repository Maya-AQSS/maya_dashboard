import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '../../../shared/i18n'
import { getToolsData } from '../api/toolsApi'

function resolveToolsErrorMessage(err, fallbackKey, t) {
  const msg = err?.message ?? ''
  if (msg.startsWith('tools.')) return t(msg)
  if (msg) return msg
  return t(fallbackKey)
}

function useToolsData() {
  const { user } = useAuth()
  const { t } = useLocale()
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

  const toggleFavorite = async (id) => {
    setTools((prev) => {
      return prev.map((tool) =>
        tool.id === id ? { ...tool, isFavorite: !tool.isFavorite } : tool,
      )
    })
  }

  return { tools, loading, error, toggleFavorite }
}

export default useToolsData
