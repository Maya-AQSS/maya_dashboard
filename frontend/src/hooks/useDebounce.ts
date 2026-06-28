import { useEffect, useMemo, useRef } from 'react'

/**
 * Versión debounced de un callback. Centraliza el patrón manual
 * `useRef<setTimeout> + clearTimeout + setTimeout` repetido en las páginas de
 * búsqueda (filtros server-side). Cada invocación reinicia el temporizador; el
 * callback sólo se ejecuta cuando han pasado `delay` ms sin nuevas llamadas.
 *
 * - El timer pendiente se cancela automáticamente al desmontar.
 * - `cancel()` descarta una ejecución pendiente (p. ej. al limpiar filtros).
 *
 * @param callback  Función a diferir. Siempre se invoca la última referencia.
 * @param delay     Milisegundos de espera tras la última llamada.
 */
export function useDebounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number,
): ((...args: TArgs) => void) & { cancel: () => void } {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Siempre apunta a la última closure sin recrear el callback debounced.
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cancela cualquier timer pendiente al desmontar.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return useMemo(() => {
    const cancel = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const debounced = (...args: TArgs) => {
      cancel()
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        callbackRef.current(...args)
      }, delay)
    }

    return Object.assign(debounced, { cancel })
  }, [delay])
}
