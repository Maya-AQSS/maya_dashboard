import { afterEach, beforeEach, describe, expect, it, vi } from'vitest'
import { renderHook, act, waitFor } from'@testing-library/react'
import useFavorites from'./useFavorites'

vi.mock('@maya/shared-auth-react', () => ({
 useAuth: vi.fn(),
}))

vi.mock('../../../shared/i18n', () => ({
 useLocale: vi.fn(),
}))

vi.mock('../api/favoritesApi', () => ({
 getFavorites: vi.fn(),
 addFavorite: vi.fn(),
 removeFavorite: vi.fn(),
}))

import { useAuth } from'@maya/shared-auth-react'
import { useLocale } from'../../../shared/i18n'
import { getFavorites, addFavorite, removeFavorite } from'../api/favoritesApi'

const mockUser = { sub:'u-123', token:'tok-abc' }

beforeEach(() => {
 useAuth.mockReturnValue({ user: mockUser })
 useLocale.mockReturnValue({ t: (key) => key })
 getFavorites.mockResolvedValue([])
 addFavorite.mockResolvedValue({ id: 1, name:'App' })
 removeFavorite.mockResolvedValue(undefined)
})

afterEach(() => {
 vi.clearAllMocks()
})

describe('useFavorites', () => {
 describe('carga inicial', () => {
 it('carga favoritos al montar con user válido', async () => {
 const payload = [{ id: 1, name:'Maya DMS' }]
 getFavorites.mockResolvedValue(payload)

 const { result } = renderHook(() => useFavorites())

 await waitFor(() => expect(result.current.loading).toBe(false))

 expect(getFavorites).toHaveBeenCalledWith('u-123','tok-abc')
 expect(result.current.favorites).toEqual(payload)
 expect(result.current.error).toBeNull()
 })

 it('inicia con loading true mientras carga', async () => {
 let resolve
 getFavorites.mockReturnValue(new Promise((r) => { resolve = r }))

 const { result } = renderHook(() => useFavorites())

 expect(result.current.loading).toBe(true)

 await act(async () => { resolve([]) })
 })

 it('no hace fetch si no hay user.sub', () => {
 useAuth.mockReturnValue({ user: { sub:'', token:'tok-abc' } })

 renderHook(() => useFavorites())

 expect(getFavorites).not.toHaveBeenCalled()
 })

 it('no hace fetch si no hay user.token', () => {
 useAuth.mockReturnValue({ user: { sub:'u-123', token:'' } })

 renderHook(() => useFavorites())

 expect(getFavorites).not.toHaveBeenCalled()
 })

 it('no hace fetch si user es null', () => {
 useAuth.mockReturnValue({ user: null })

 renderHook(() => useFavorites())

 expect(getFavorites).not.toHaveBeenCalled()
 })

 it('devuelve favorites=[] y loading=false si no hay user', () => {
 useAuth.mockReturnValue({ user: null })

 const { result } = renderHook(() => useFavorites())

 expect(result.current.favorites).toEqual([])
 expect(result.current.loading).toBe(false)
 })

 it('establece error con clave i18n si getFavorites lanza error con prefijo favorites.', async () => {
 getFavorites.mockRejectedValue(new Error('favorites.errorLoad'))

 const { result } = renderHook(() => useFavorites())

 await waitFor(() => expect(result.current.loading).toBe(false))

 expect(result.current.error).toBe('favorites.errorLoad')
 expect(result.current.favorites).toEqual([])
 })

 it('establece error con mensaje raw si getFavorites lanza error sin prefijo', async () => {
 getFavorites.mockRejectedValue(new Error('network failure'))

 const { result } = renderHook(() => useFavorites())

 await waitFor(() => expect(result.current.loading).toBe(false))

 expect(result.current.error).toBe('network failure')
 })

 it('establece error con fallbackKey si getFavorites lanza error sin mensaje', async () => {
 getFavorites.mockRejectedValue(new Error(''))

 const { result } = renderHook(() => useFavorites())

 await waitFor(() => expect(result.current.loading).toBe(false))

 expect(result.current.error).toBe('favorites.errorLoad')
 })

 it('re-fetch cuando cambia user.sub', async () => {
 const { result, rerender } = renderHook(() => useFavorites())

 await waitFor(() => expect(result.current.loading).toBe(false))
 expect(getFavorites).toHaveBeenCalledTimes(1)

 useAuth.mockReturnValue({ user: { sub:'u-456', token:'tok-abc' } })
 rerender()

 await waitFor(() => expect(getFavorites).toHaveBeenCalledTimes(2))
 expect(getFavorites).toHaveBeenLastCalledWith('u-456','tok-abc')
 })
 })

 describe('add', () => {
 it('llama addFavorite y agrega el resultado a la lista', async () => {
 const existing = [{ id: 1, name:'App A' }]
 const added = { id: 2, name:'App B' }
 getFavorites.mockResolvedValue(existing)
 addFavorite.mockResolvedValue(added)

 const { result } = renderHook(() => useFavorites())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.add(2) })

 expect(addFavorite).toHaveBeenCalledWith('u-123', 2,'tok-abc')
 expect(result.current.favorites).toEqual([...existing, added])
 })

 it('no duplica si el favorito ya existe', async () => {
 const existing = [{ id: 1, name:'App A' }]
 getFavorites.mockResolvedValue(existing)
 addFavorite.mockResolvedValue({ id: 1, name:'App A' })

 const { result } = renderHook(() => useFavorites())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.add(1) })

 expect(result.current.favorites).toEqual(existing)
 })

 it('no llama addFavorite si no hay user.sub', async () => {
 useAuth.mockReturnValue({ user: { sub:'', token:'tok-abc' } })

 const { result } = renderHook(() => useFavorites())

 await act(async () => { await result.current.add(1) })

 expect(addFavorite).not.toHaveBeenCalled()
 })

 it('no llama addFavorite si no hay user.token', async () => {
 useAuth.mockReturnValue({ user: { sub:'u-123', token:'' } })

 const { result } = renderHook(() => useFavorites())

 await act(async () => { await result.current.add(1) })

 expect(addFavorite).not.toHaveBeenCalled()
 })

 it('establece error si addFavorite lanza', async () => {
 getFavorites.mockResolvedValue([])
 addFavorite.mockRejectedValue(new Error('favorites.errorAdd'))

 const { result } = renderHook(() => useFavorites())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.add(1) })

 expect(result.current.error).toBe('favorites.errorAdd')
 })

 it('no modifica la lista si addFavorite lanza', async () => {
 const existing = [{ id: 1, name:'App A' }]
 getFavorites.mockResolvedValue(existing)
 addFavorite.mockRejectedValue(new Error('favorites.errorAdd'))

 const { result } = renderHook(() => useFavorites())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.add(2) })

 expect(result.current.favorites).toEqual(existing)
 })
 })

 describe('remove', () => {
 it('llama removeFavorite y elimina el elemento de la lista', async () => {
 const existing = [{ id: 1, name:'App A' }, { id: 2, name:'App B' }]
 getFavorites.mockResolvedValue(existing)
 removeFavorite.mockResolvedValue(undefined)

 const { result } = renderHook(() => useFavorites())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.remove(1) })

 expect(removeFavorite).toHaveBeenCalledWith('u-123', 1,'tok-abc')
 expect(result.current.favorites).toEqual([{ id: 2, name:'App B' }])
 })

 it('no llama removeFavorite si no hay user.sub', async () => {
 useAuth.mockReturnValue({ user: { sub:'', token:'tok-abc' } })

 const { result } = renderHook(() => useFavorites())

 await act(async () => { await result.current.remove(1) })

 expect(removeFavorite).not.toHaveBeenCalled()
 })

 it('no llama removeFavorite si no hay user.token', async () => {
 useAuth.mockReturnValue({ user: { sub:'u-123', token:'' } })

 const { result } = renderHook(() => useFavorites())

 await act(async () => { await result.current.remove(1) })

 expect(removeFavorite).not.toHaveBeenCalled()
 })

 it('establece error si removeFavorite lanza', async () => {
 getFavorites.mockResolvedValue([{ id: 1, name:'App A' }])
 removeFavorite.mockRejectedValue(new Error('favorites.errorRemove'))

 const { result } = renderHook(() => useFavorites())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.remove(1) })

 expect(result.current.error).toBe('favorites.errorRemove')
 })

 it('no modifica la lista si removeFavorite lanza', async () => {
 const existing = [{ id: 1, name:'App A' }]
 getFavorites.mockResolvedValue(existing)
 removeFavorite.mockRejectedValue(new Error('favorites.errorRemove'))

 const { result } = renderHook(() => useFavorites())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.remove(1) })

 expect(result.current.favorites).toEqual(existing)
 })
 })
})
