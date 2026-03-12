import { useEffect, useState } from 'react'
import { getToolsData, toggleToolFavorite } from '../api/toolsApi'


function sortToolsByFavoriteAndName(tools) {

  return [...tools].sort((a, b) => {
    if (a.is_favorite === b.is_favorite) {
      return a.name.localeCompare(b.name)
    }

    return a.is_favorite ? -1 : 1
  })
}


function useToolsData() {

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

          const toolsFromApi = response.applications || []

          setTools(sortToolsByFavoriteAndName(toolsFromApi))
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message ?? 'Error al cargar las herramientas')
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
        const next = prev.map((tool) =>
          tool.id === updated.id ? { ...tool, is_favorite: updated.is_favorite } : tool
        )
        
        return sortToolsByFavoriteAndName(next)
      })
    } catch (error) {
      setError(error.message ?? 'Error al actualizar favoritas')
    }

  }

  return { tools, loading, error, toggleFavorite }
}

export default useToolsData