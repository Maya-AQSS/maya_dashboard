import { createContext, useCallback, useContext, useEffect, useState } from'react'
import { useAuth } from'@maya/shared-auth-react'
import { notifyFavoritesChanged } from'@maya/shared-sidebar-react'
import { getFavorites, addFavorite, removeFavorite } from'../api/favoritesApi'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
 const { user, token } = useAuth()
 const [favorites, setFavorites] = useState([])
 const [loading, setLoading] = useState(false)

 useEffect(() => {
 if (!user?.sub || !token) {
 setFavorites([])
 setLoading(false)
 return
 }
 let isMounted = true
 setLoading(true)
 getFavorites(user.sub, token)
 .then((data) => { if (isMounted) setFavorites(data) })
 .catch(() => { if (isMounted) setFavorites([]) })
 .finally(() => { if (isMounted) setLoading(false) })
 return () => { isMounted = false }
 }, [user?.sub, token])

 const add = useCallback(async (applicationId) => {
 if (!user?.sub || !token) return
 setFavorites((prev) =>
 prev.some((f) => f.id === applicationId) ? prev : [...prev, { id: applicationId }],
 )
 try {
 const added = await addFavorite(user.sub, applicationId, token)
 setFavorites((prev) => prev.map((f) => (f.id === applicationId ? added : f)))
 notifyFavoritesChanged()
 } catch {
 setFavorites((prev) => prev.filter((f) => f.id !== applicationId))
 }
 }, [user?.sub, token])

 const remove = useCallback(async (applicationId) => {
 if (!user?.sub || !token) return
 let removed = null
 setFavorites((prev) => {
 removed = prev.find((f) => f.id === applicationId) ?? null
 return prev.filter((f) => f.id !== applicationId)
 })
 try {
 await removeFavorite(user.sub, applicationId, token)
 notifyFavoritesChanged()
 } catch {
 if (removed) setFavorites((prev) => [...prev, removed])
 }
 }, [user?.sub, token])

 return (<FavoritesContext.Provider value={{ favorites, loading, add, remove }}>
 {children}
 </FavoritesContext.Provider>
 )
}

export function useFavoritesContext() {
 const ctx = useContext(FavoritesContext)
 if (!ctx) throw new Error('useFavoritesContext must be inside FavoritesProvider')
 return ctx
}
