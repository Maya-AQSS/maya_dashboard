import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFichajeAlerts } from './useFichajeAlerts'

describe('useFichajeAlerts', () => {
  describe('estado inicial (sin fichar)', () => {
    it('retorna una alerta amber de "no fichado"', () => {
      const { result } = renderHook(() => useFichajeAlerts())

      expect(result.current.alerts).toHaveLength(1)
      expect(result.current.alerts[0].id).toBe('local:no-fichado')
      expect(result.current.alerts[0].color).toBe('amber')
      expect(result.current.alerts[0].actionKind).toBe('clockIn')
    })

    it('la alerta inicial es descartable (canDismiss=true)', () => {
      const { result } = renderHook(() => useFichajeAlerts())
      expect(result.current.alerts[0].canDismiss).toBe(true)
    })

    it('expone la función clockIn', () => {
      const { result } = renderHook(() => useFichajeAlerts())
      expect(typeof result.current.clockIn).toBe('function')
    })
  })

  describe('después de fichar', () => {
    it('cambia la alerta a green con la hora de fichaje', () => {
      const { result } = renderHook(() => useFichajeAlerts())

      act(() => {
        result.current.clockIn()
      })

      expect(result.current.alerts).toHaveLength(1)
      expect(result.current.alerts[0].id).toBe('local:fichado')
      expect(result.current.alerts[0].color).toBe('green')
    })

    it('la alerta de fichado no tiene actionLabel', () => {
      const { result } = renderHook(() => useFichajeAlerts())

      act(() => {
        result.current.clockIn()
      })

      expect(result.current.alerts[0].actionLabel).toBeNull()
    })

    it('el texto incluye la hora en formato HH:MM', () => {
      const { result } = renderHook(() => useFichajeAlerts())

      act(() => {
        result.current.clockIn()
      })

      expect(result.current.alerts[0].text).toMatch(/\d{2}:\d{2}/)
    })
  })
})
