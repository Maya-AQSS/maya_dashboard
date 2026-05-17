import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock import.meta.env.DEV to control MOCK_HISTORY population
vi.stubEnv('DEV', true)

// The hook module uses MOCK_HISTORY as a module-level constant built at init.
// We import AFTER stubbing env so buildMockHistory() runs with DEV=true.
import useDailyFichajes from './useDailyFichajes'

describe('useDailyFichajes', () => {
  describe('hook return shape', () => {
    it('devuelve loading false y error undefined siempre', () => {
      const { result } = renderHook(() =>
        useDailyFichajes('user-1', new Date()),
      )
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeUndefined()
    })

    it('devuelve un array de entries', () => {
      const { result } = renderHook(() =>
        useDailyFichajes('user-1', new Date()),
      )
      expect(Array.isArray(result.current.entries)).toBe(true)
    })

    it('acepta userId undefined sin errores', () => {
      const { result } = renderHook(() =>
        useDailyFichajes(undefined, new Date()),
      )
      expect(result.current.loading).toBe(false)
      expect(Array.isArray(result.current.entries)).toBe(true)
    })
  })

  describe('datos mock de los últimos 7 días (DEV=true)', () => {
    it('devuelve entries para today', () => {
      const today = new Date()
      const { result } = renderHook(() =>
        useDailyFichajes('user-1', today),
      )
      // In DEV mode MOCK_HISTORY is populated for today
      expect(result.current.entries.length).toBeGreaterThan(0)
    })

    it('devuelve entries para ayer', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const { result } = renderHook(() =>
        useDailyFichajes('user-1', yesterday),
      )
      expect(result.current.entries.length).toBeGreaterThan(0)
    })

    it('devuelve entries para hace 6 días', () => {
      const sixDaysAgo = new Date()
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6)
      const { result } = renderHook(() =>
        useDailyFichajes('user-1', sixDaysAgo),
      )
      expect(result.current.entries.length).toBeGreaterThan(0)
    })

    it('devuelve array vacío para fecha futura', () => {
      const future = new Date()
      future.setDate(future.getDate() + 10)
      const { result } = renderHook(() =>
        useDailyFichajes('user-1', future),
      )
      expect(result.current.entries).toHaveLength(0)
    })

    it('devuelve array vacío para fecha anterior a los 7 días', () => {
      const old = new Date()
      old.setDate(old.getDate() - 30)
      const { result } = renderHook(() =>
        useDailyFichajes('user-1', old),
      )
      expect(result.current.entries).toHaveLength(0)
    })

    it('cada entry tiene id, type y timestamp', () => {
      const today = new Date()
      const { result } = renderHook(() =>
        useDailyFichajes('user-1', today),
      )
      const entries = result.current.entries
      expect(entries.length).toBeGreaterThan(0)
      for (const entry of entries) {
        expect(typeof entry.id).toBe('number')
        expect(['in', 'out'].includes(entry.type)).toBe(true)
        expect(entry.timestamp instanceof Date).toBe(true)
      }
    })

    it('los tipos de entry son solo "in" o "out"', () => {
      const today = new Date()
      const { result } = renderHook(() =>
        useDailyFichajes('user-1', today),
      )
      for (const entry of result.current.entries) {
        expect(entry.type === 'in' || entry.type === 'out').toBe(true)
      }
    })

    it('los timestamps corresponden al día solicitado', () => {
      const today = new Date()
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const { result } = renderHook(() =>
        useDailyFichajes('user-1', today),
      )
      for (const entry of result.current.entries) {
        const ts = entry.timestamp
        const entryStr = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}-${String(ts.getDate()).padStart(2, '0')}`
        expect(entryStr).toBe(todayStr)
      }
    })
  })

  describe('estabilidad del resultado', () => {
    it('devuelve el mismo resultado para la misma fecha en llamadas consecutivas', () => {
      const date = new Date()
      const { result: r1 } = renderHook(() => useDailyFichajes('u1', date))
      const { result: r2 } = renderHook(() => useDailyFichajes('u1', date))
      expect(r1.current.entries.length).toBe(r2.current.entries.length)
    })

    it('el userId no afecta el resultado (mock ignora userId)', () => {
      const date = new Date()
      const { result: r1 } = renderHook(() => useDailyFichajes('user-A', date))
      const { result: r2 } = renderHook(() => useDailyFichajes('user-B', date))
      expect(r1.current.entries.length).toBe(r2.current.entries.length)
    })
  })
})
