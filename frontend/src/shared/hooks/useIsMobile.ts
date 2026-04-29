import { useState, useEffect } from'react'

const MOBILE_BREAKPOINT ='(max-width: 639px)'

/**
 * Devuelve true si el viewport está por debajo del breakpoint mobile.
 * Usa un único media query listener para evitar duplicación.
 * @returns {boolean}
 */
function useIsMobile() {
 const [isMobile, setIsMobile] = useState(() => typeof window !=='undefined' && window.matchMedia(MOBILE_BREAKPOINT).matches,
 )

 useEffect(() => {
 if (typeof window ==='undefined') return undefined
 const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT)
 const handleChange = (event) => setIsMobile(event.matches)
 mediaQuery.addEventListener('change', handleChange)
 return () => mediaQuery.removeEventListener('change', handleChange)
 }, [])

 return isMobile
}

export { useIsMobile, MOBILE_BREAKPOINT }
