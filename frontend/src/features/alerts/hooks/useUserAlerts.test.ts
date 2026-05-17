import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock child hooks so useUserAlerts can be tested in isolation
vi.mock('./useActiveSystemAlerts', () => ({
  useActiveSystemAlerts: vi.fn(),
}))

vi.mock('./useFichajeAlerts', () => ({
  useFichajeAlerts: vi.fn(),
}))

import { useActiveSystemAlerts } from './useActiveSystemAlerts'
import { useFichajeAlerts } from './useFichajeAlerts'
import { useUserAlerts } from './useUserAlerts'

const mockUseActiveSystemAlerts = vi.mocked(useActiveSystemAlerts)
const mockUseFichajeAlerts = vi.mocked(useFichajeAlerts)

const STORAGE_KEY = 'maya:dismissed-alerts'

const sysAlert = {
  id: 'srv:1',
  color: 'red' as const,
  text: 'CPU alta',
  actionLabel: null,
  canDismiss: true,
}

const fichajeAlert = {
  id: 'local:no-fichado',
  color: 'amber' as const,
  text: 'Ficha tu entrada',
  actionLabel: 'Fichar',
  actionKind: 'clockIn',
  canDismiss: true,
}

const clockInMock = vi.fn()

function setupMocks({
  systemAlerts = [sysAlert],
  systemLoading = false,
  fichajeAlerts = [fichajeAlert],
}: {
  systemAlerts?: typeof sysAlert[]
  systemLoading?: boolean
  fichajeAlerts?: typeof fichajeAlert[]
} = {}) {
  mockUseActiveSystemAlerts.mockReturnValue({ alerts: systemAlerts, loading: systemLoading })
  mockUseFichajeAlerts.mockReturnValue({ alerts: fichajeAlerts, clockIn: clockInMock })
}

describe('useUserAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    setupMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('combinación de alertas', () => {
    it('combina fichaje y system alerts en ese orden', () => {
      const { result } = renderHook(() => useUserAlerts())

      expect(result.current.alerts).toHaveLength(2)
      expect(result.current.alerts[0].id).toBe('local:no-fichado')
      expect(result.current.alerts[1].id).toBe('srv:1')
    })

    it('expone clockIn del hook de fichaje', () => {
      const { result } = renderHook(() => useUserAlerts())
      expect(result.current.clockIn).toBe(clockInMock)
    })

    it('propaga loading del hook de sistema', () => {
      setupMocks({ systemLoading: true })
      const { result } = renderHook(() => useUserAlerts())
      expect(result.current.loading).toBe(true)
    })

    it('devuelve loading=false cuando ambos hooks están listos', () => {
      setupMocks({ systemLoading: false })
      const { result } = renderHook(() => useUserAlerts())
      expect(result.current.loading).toBe(false)
    })
  })

  describe('dismiss de alertas', () => {
    it('dismiss elimina la alerta de la lista visible', () => {
      const { result } = renderHook(() => useUserAlerts())

      act(() => {
        result.current.dismiss('srv:1')
      })

      expect(result.current.alerts.find((a) => a.id === 'srv:1')).toBeUndefined()
    })

    it('dismiss persiste en localStorage', () => {
      const { result } = renderHook(() => useUserAlerts())

      act(() => {
        result.current.dismiss('srv:1')
      })

      const raw = localStorage.getItem(STORAGE_KEY)
      expect(raw).toBeTruthy()
      const entry = JSON.parse(raw!)
      expect(entry.ids).toContain('srv:1')
    })

    it('dismiss de id ya descartada no rompe nada', () => {
      const { result } = renderHook(() => useUserAlerts())

      act(() => {
        result.current.dismiss('srv:1')
        result.current.dismiss('srv:1') // duplicado
      })

      expect(result.current.alerts.find((a) => a.id === 'srv:1')).toBeUndefined()
    })

    it('mantiene las alertas no descartadas después de dismiss', () => {
      const { result } = renderHook(() => useUserAlerts())

      act(() => {
        result.current.dismiss('srv:1')
      })

      expect(result.current.alerts.find((a) => a.id === 'local:no-fichado')).toBeTruthy()
    })
  })

  describe('carga de dismissed desde localStorage', () => {
    it('filtra alertas cuyo id está en localStorage al montar', () => {
      // Pre-populate storage with a valid non-expired entry
      const entry = { ids: ['srv:1'], expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))

      const { result } = renderHook(() => useUserAlerts())

      expect(result.current.alerts.find((a) => a.id === 'srv:1')).toBeUndefined()
      // fichajeAlert should still be visible
      expect(result.current.alerts.find((a) => a.id === 'local:no-fichado')).toBeTruthy()
    })

    it('ignora entrada de localStorage expirada', () => {
      const entry = { ids: ['srv:1'], expiresAt: Date.now() - 1000 }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))

      const { result } = renderHook(() => useUserAlerts())

      // Expired — srv:1 should still be visible (not in dismissed set)
      expect(result.current.alerts.find((a) => a.id === 'srv:1')).toBeTruthy()
      // Note: the useEffect for saveDismissed re-writes the key with empty ids.
      // We only care the alert is not filtered out.
    })

    it('maneja JSON inválido en localStorage sin lanzar error', () => {
      localStorage.setItem(STORAGE_KEY, 'NOT_JSON{{{')

      // Should not throw
      expect(() => renderHook(() => useUserAlerts())).not.toThrow()
    })

    it('con localStorage inválido muestra todas las alertas', () => {
      localStorage.setItem(STORAGE_KEY, 'BAD_JSON')

      const { result } = renderHook(() => useUserAlerts())

      expect(result.current.alerts).toHaveLength(2)
    })
  })

  describe('sin alertas', () => {
    it('devuelve array vacío cuando ambos hooks no retornan alertas', () => {
      setupMocks({ systemAlerts: [], fichajeAlerts: [] })
      const { result } = renderHook(() => useUserAlerts())
      expect(result.current.alerts).toHaveLength(0)
    })
  })
})
