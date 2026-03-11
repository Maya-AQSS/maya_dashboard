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
          setTechnologies(response.applications || [])
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