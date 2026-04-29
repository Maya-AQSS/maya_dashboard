import { afterEach, beforeEach, describe, expect, it, vi } from'vitest'
import { renderHook, act, waitFor } from'@testing-library/react'
import useDashboardLayout from'./useDashboardLayout'

vi.mock('@maya/shared-auth-react', () => ({
 useAuth: vi.fn(),
}))

vi.mock('../../../shared/i18n', () => ({
 useLocale: vi.fn(),
}))

vi.mock('../api/dashboardLayoutApi', () => ({
 getDashboardLayout: vi.fn(),
 updateDashboardLayout: vi.fn(),
}))

import { useAuth } from'@maya/shared-auth-react'
import { useLocale } from'../../../shared/i18n'
import { getDashboardLayout, updateDashboardLayout } from'../api/dashboardLayoutApi'

const mockUser = { sub:'u-123', token:'tok-abc' }

beforeEach(() => {
 useAuth.mockReturnValue({ user: mockUser })
 useLocale.mockReturnValue({ t: (key) => key })
 getDashboardLayout.mockResolvedValue({ layout: [], updated_at:'2024-01-01T00:00:00Z' })
 updateDashboardLayout.mockResolvedValue({ layout: [], updated_at:'2024-01-01T00:00:00Z' })
})

afterEach(() => {
 vi.clearAllMocks()
})

describe('useDashboardLayout', () => {
 describe('carga inicial', () => {
 it('carga layout al montar con user válido', async () => {
 const layout = { cols: 3, rows: 2 }
 getDashboardLayout.mockResolvedValue({ layout, updated_at:'2024-01-01T00:00:00Z' })

 const { result } = renderHook(() => useDashboardLayout())

 await waitFor(() => expect(result.current.loading).toBe(false))

 expect(getDashboardLayout).toHaveBeenCalledWith('u-123','tok-abc')
 expect(result.current.layout).toEqual(layout)
 expect(result.current.error).toBeNull()
 })

 it('inicia con loading true mientras carga', async () => {
 let resolve
 getDashboardLayout.mockReturnValue(new Promise((r) => { resolve = r }))

 const { result } = renderHook(() => useDashboardLayout())

 expect(result.current.loading).toBe(true)

 await act(async () => { resolve({ layout: [] }) })
 })

 it('usa [] si la respuesta no contiene layout', async () => {
 getDashboardLayout.mockResolvedValue({ updated_at:'2024-01-01T00:00:00Z' })

 const { result } = renderHook(() => useDashboardLayout())

 await waitFor(() => expect(result.current.loading).toBe(false))

 expect(result.current.layout).toEqual([])
 })

 it('no hace fetch si no hay user.sub', () => {
 useAuth.mockReturnValue({ user: { sub:'', token:'tok-abc' } })

 renderHook(() => useDashboardLayout())

 expect(getDashboardLayout).not.toHaveBeenCalled()
 })

 it('no hace fetch si no hay user.token', () => {
 useAuth.mockReturnValue({ user: { sub:'u-123', token:'' } })

 renderHook(() => useDashboardLayout())

 expect(getDashboardLayout).not.toHaveBeenCalled()
 })

 it('no hace fetch si user es null', () => {
 useAuth.mockReturnValue({ user: null })

 renderHook(() => useDashboardLayout())

 expect(getDashboardLayout).not.toHaveBeenCalled()
 })

 it('devuelve layout=[] y loading=false si no hay user', () => {
 useAuth.mockReturnValue({ user: null })

 const { result } = renderHook(() => useDashboardLayout())

 expect(result.current.layout).toEqual([])
 expect(result.current.loading).toBe(false)
 })

 it('establece error con clave i18n si getDashboardLayout lanza error con prefijo dashboardLayout.', async () => {
 getDashboardLayout.mockRejectedValue(new Error('dashboardLayout.errorLoad'))

 const { result } = renderHook(() => useDashboardLayout())

 await waitFor(() => expect(result.current.loading).toBe(false))

 expect(result.current.error).toBe('dashboardLayout.errorLoad')
 expect(result.current.layout).toEqual([])
 })

 it('establece error con mensaje raw si getDashboardLayout lanza error sin prefijo', async () => {
 getDashboardLayout.mockRejectedValue(new Error('network failure'))

 const { result } = renderHook(() => useDashboardLayout())

 await waitFor(() => expect(result.current.loading).toBe(false))

 expect(result.current.error).toBe('network failure')
 })

 it('establece error con fallbackKey si getDashboardLayout lanza error sin mensaje', async () => {
 getDashboardLayout.mockRejectedValue(new Error(''))

 const { result } = renderHook(() => useDashboardLayout())

 await waitFor(() => expect(result.current.loading).toBe(false))

 expect(result.current.error).toBe('dashboardLayout.errorLoad')
 })

 it('re-fetch cuando cambia user.sub', async () => {
 const { result, rerender } = renderHook(() => useDashboardLayout())

 await waitFor(() => expect(result.current.loading).toBe(false))
 expect(getDashboardLayout).toHaveBeenCalledTimes(1)

 useAuth.mockReturnValue({ user: { sub:'u-456', token:'tok-abc' } })
 rerender()

 await waitFor(() => expect(getDashboardLayout).toHaveBeenCalledTimes(2))
 expect(getDashboardLayout).toHaveBeenLastCalledWith('u-456','tok-abc')
 })
 })

 describe('saveLayout', () => {
 it('llama updateDashboardLayout y actualiza el layout', async () => {
 const newLayout = { cols: 4, rows: 3 }
 const updated = { layout: newLayout, updated_at:'2024-06-01T00:00:00Z' }
 getDashboardLayout.mockResolvedValue({ layout: { cols: 2 } })
 updateDashboardLayout.mockResolvedValue(updated)

 const { result } = renderHook(() => useDashboardLayout())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.saveLayout(newLayout) })

 expect(updateDashboardLayout).toHaveBeenCalledWith('u-123', newLayout,'tok-abc')
 expect(result.current.layout).toEqual(newLayout)
 })

 it('usa [] si la respuesta de saveLayout no contiene layout', async () => {
 getDashboardLayout.mockResolvedValue({ layout: { cols: 2 } })
 updateDashboardLayout.mockResolvedValue({ updated_at:'2024-06-01T00:00:00Z' })

 const { result } = renderHook(() => useDashboardLayout())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.saveLayout({}) })

 expect(result.current.layout).toEqual([])
 })

 it('no llama updateDashboardLayout si no hay user.sub', async () => {
 useAuth.mockReturnValue({ user: { sub:'', token:'tok-abc' } })

 const { result } = renderHook(() => useDashboardLayout())

 await act(async () => { await result.current.saveLayout({ cols: 3 }) })

 expect(updateDashboardLayout).not.toHaveBeenCalled()
 })

 it('no llama updateDashboardLayout si no hay user.token', async () => {
 useAuth.mockReturnValue({ user: { sub:'u-123', token:'' } })

 const { result } = renderHook(() => useDashboardLayout())

 await act(async () => { await result.current.saveLayout({ cols: 3 }) })

 expect(updateDashboardLayout).not.toHaveBeenCalled()
 })

 it('establece error si updateDashboardLayout lanza', async () => {
 getDashboardLayout.mockResolvedValue({ layout: { cols: 2 } })
 updateDashboardLayout.mockRejectedValue(new Error('dashboardLayout.errorSave'))

 const { result } = renderHook(() => useDashboardLayout())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.saveLayout({ cols: 3 }) })

 expect(result.current.error).toBe('dashboardLayout.errorSave')
 })

 it('no modifica el layout si updateDashboardLayout lanza', async () => {
 const existing = { cols: 2, rows: 1 }
 getDashboardLayout.mockResolvedValue({ layout: existing })
 updateDashboardLayout.mockRejectedValue(new Error('dashboardLayout.errorSave'))

 const { result } = renderHook(() => useDashboardLayout())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.saveLayout({ cols: 3 }) })

 expect(result.current.layout).toEqual(existing)
 })

 it('establece error con mensaje raw si updateDashboardLayout lanza error sin prefijo', async () => {
 getDashboardLayout.mockResolvedValue({ layout: [] })
 updateDashboardLayout.mockRejectedValue(new Error('unexpected error'))

 const { result } = renderHook(() => useDashboardLayout())
 await waitFor(() => expect(result.current.loading).toBe(false))

 await act(async () => { await result.current.saveLayout({}) })

 expect(result.current.error).toBe('unexpected error')
 })
 })
})
