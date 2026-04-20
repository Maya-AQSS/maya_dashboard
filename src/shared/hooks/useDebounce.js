import { useState, useEffect } from 'react'

/**
 * Retrasa la actualización de un valor hasta que pasen `delay` ms sin cambios.
 * @param {*} value - Valor a debouncear
 * @param {number} delay - Tiempo de espera en ms
 * @returns {*} Valor debounced
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

export { useDebounce }
