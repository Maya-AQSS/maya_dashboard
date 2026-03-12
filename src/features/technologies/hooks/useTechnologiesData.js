import { useEffect, useState } from 'react'
import { getTechnologiesData } from '../api/technologiesApi'

function useTechnologiesData() {

  const [technologies, setTechnologies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await getTechnologiesData()

        if (isMounted) {
          
          const technologiesFromApi = response.applications || []

          const sortedTechnologies = [...technologiesFromApi].sort((a, b) => {
            if (a.is_favorite === b.is_favorite) {
              return a.name.localeCompare(b.name)
            }

            return a.is_favorite ? -1 : 1
          })

          setTechnologies(sortedTechnologies)
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message ?? 'Error al cargar las tecnologías')
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

  return { technologies, loading, error }
}

export default useTechnologiesData