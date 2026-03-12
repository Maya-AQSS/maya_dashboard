import { useEffect, useState } from 'react'
import { getTechnologyById, toggleTechnologyFavorite } from '../api/technologiesApi'

function useTechnologyDetail(id) {

    const [technology, setTechnology] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!id) return

        let isMounted = true

        async function fetchTechnology() {
            setLoading(true)
            setError(null)

            try {
                const response = await getTechnologyById(id)
                
                if (isMounted) {
                    setTechnology(response)
                }
            } catch (error) {
                if (isMounted) {
                    setError(error.message ?? 'Error al cargar la tecnología')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchTechnology()

        return () => {
            isMounted = false
        }
    }, [id])

    async function handleToggleFavorite() {
        if (!technology) return

        try {
            const updated = await toggleTechnologyFavorite(technology.id)
            setTechnology(updated)
        } catch (error) {
            setError(error.message ?? 'Error al actualizar la tecnología')
        }
    }

    return { technology, loading, error, toggleFavorite: handleToggleFavorite }
}

export default useTechnologyDetail