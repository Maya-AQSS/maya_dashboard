import { useEffect, useState } from 'react'
import { getDashboardData } from '../api/dashboardApi'

function useDashboardData() {

  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const response = await getDashboardData()
        if (isMounted) {
          setApplications(response.applications || [])
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message ?? 'Error al cargar el dashboard')
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

  return { applications, loading, error }
}

export default useDashboardData