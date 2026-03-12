import { useEffect, useState } from 'react'
import { getToolsData } from '../api/toolsApi'

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

          const sortedTools = [...toolsFromApi].sort((a, b) => {
            if (a.is_favorite === b.is_favorite) {
              return a.name.localeCompare(b.name)
            }

            return a.is_favorite ? -1 : 1
          })

          setTools(sortedTools)
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

  return { tools, loading, error }
}

export default useToolsData