import { describe, it, expect, vi, beforeEach, afterEach } from'vitest'
import { renderHook, act } from'@testing-library/react'
import { useDebounce } from'./useDebounce'

describe('useDebounce', () => {
 beforeEach(() => {
 vi.useFakeTimers()
 })

 afterEach(() => {
 vi.useRealTimers()
 })

 it('devuelve el valor inicial inmediatamente', () => {
 const { result } = renderHook(() => useDebounce('inicial', 300))
 expect(result.current).toBe('inicial')
 })

 it('no actualiza el valor antes de que pase el delay', () => {
 const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
 initialProps: { value:'primero' },
 })

 rerender({ value:'segundo' })
 vi.advanceTimersByTime(200)

 expect(result.current).toBe('primero')
 })

 it('actualiza el valor después del delay', () => {
 const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
 initialProps: { value:'primero' },
 })

 rerender({ value:'segundo' })

 act(() => {
 vi.advanceTimersByTime(300)
 })

 expect(result.current).toBe('segundo')
 })

 it('solo aplica el último valor si cambia varias veces antes del delay', () => {
 const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
 initialProps: { value:'a' },
 })

 rerender({ value:'b' })
 vi.advanceTimersByTime(100)
 rerender({ value:'c' })
 vi.advanceTimersByTime(100)
 rerender({ value:'d' })

 act(() => {
 vi.advanceTimersByTime(300)
 })

 expect(result.current).toBe('d')
 })

 it('limpia el timer al desmontar', () => {
 const clearTimeoutSpy = vi.spyOn(globalThis,'clearTimeout')
 const { unmount } = renderHook(() => useDebounce('valor', 300))

 unmount()

 expect(clearTimeoutSpy).toHaveBeenCalled()
 clearTimeoutSpy.mockRestore()
 })
})
