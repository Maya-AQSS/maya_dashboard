import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

/**
 * El hook usa `createDataHook` + `createMutationHook` de
 * `@ceedcv-maya/shared-auth-react`, que internamente llaman a `useQuery` /
 * `useMutation` de TanStack — y esa instancia de TanStack resuelve una
 * copia de React diferente a la del app (dual-react problem en monorepo).
 * Por eso mockeamos los factories: cada factory devuelve un hook simple
 * que sólo dispara el fetcher y mantiene el estado en useState.
 *
 * Trade-off conocido: no estamos testeando la integración con TanStack,
 * solo el contrato público del hook (`layout`, `loading`, `error`,
 * `saveLayout`, `resetToDefault`). Para verificar la integración real
 * con cache se necesitaría un test e2e o un setup de dedupe de React.
 */
vi.mock('@ceedcv-maya/shared-auth-react', () => {
  // Estado mínimo de un query simulado: arranca llamando al fetcher y
  // expone { data, isLoading, error }. Re-fetch en cambio de queryKey
  // se ignora por simplicidad — los tests usan rerender mínimo.
  return {
    useAuth: vi.fn(),
    createDataHook: ({ fetcher }: { fetcher: (args: any) => Promise<any> }) => {
      return function useFakeQuery(args: any, options: { enabled?: boolean } = {}) {
        const enabled = options.enabled !== false
        const [state, setState] = (require('react') as typeof import('react')).useState<{
          data: any; isLoading: boolean; error: Error | null
        }>(() => ({ data: undefined, isLoading: enabled, error: null }))

        const ranRef = (require('react') as typeof import('react')).useRef(false)
        ;(require('react') as typeof import('react')).useEffect(() => {
          if (!enabled || ranRef.current) return
          ranRef.current = true
          fetcher(args)
            .then((data) => setState({ data, isLoading: false, error: null }))
            .catch((err) => setState({ data: undefined, isLoading: false, error: err as Error }))
        }, [enabled])

        return state as any
      }
    },
    createMutationHook: ({ mutationFn }: { mutationFn: (args: any) => Promise<any> }) => {
      return function useFakeMutation() {
        const [state, setState] = (require('react') as typeof import('react')).useState<{
          error: Error | null
        }>({ error: null })

        const mutateAsync = (require('react') as typeof import('react')).useCallback(
          async (args: any) => {
            try {
              const result = await mutationFn(args)
              setState({ error: null })
              return result
            } catch (err) {
              setState({ error: err as Error })
              throw err
            }
          },
          [],
        )

        return { mutateAsync, error: state.error } as any
      }
    },
  }
})

vi.mock('@ceedcv-maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('../api/dashboardLayoutApi', () => ({
  getDashboardLayout: vi.fn(),
  updateDashboardLayout: vi.fn(),
}))

import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import useDashboardLayout, { DEFAULT_LAYOUT } from './useDashboardLayout'
import {
  getDashboardLayout,
  updateDashboardLayout,
} from '../api/dashboardLayoutApi'

const mockUseAuth = vi.mocked(useAuth)
const mockUseLocale = vi.mocked(useLocale)
const mockGetDashboardLayout = vi.mocked(getDashboardLayout)
const mockUpdateDashboardLayout = vi.mocked(updateDashboardLayout)

const sampleLayout = [
  { i: 'w1', x: 0, y: 0, w: 4, h: 3 },
  { i: 'w2', x: 4, y: 0, w: 8, h: 3 },
]

describe('useDashboardLayout', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { sub: 'u-123', email: '', name: '', preferred_username: '' } as any,
      token: 'tok-abc',
    } as any)
    mockUseLocale.mockReturnValue({ t: (k: string) => k } as any)
    mockGetDashboardLayout.mockResolvedValue({ layout: sampleLayout })
    mockUpdateDashboardLayout.mockResolvedValue({ layout: sampleLayout })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ─── Carga inicial ────────────────────────────────────────────────
  describe('carga inicial', () => {
    it('carga layout al montar con user válido', async () => {
      const { result } = renderHook(() => useDashboardLayout())

      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(mockGetDashboardLayout).toHaveBeenCalledWith('u-123', 'tok-abc')
      expect(result.current.layout).toEqual(sampleLayout)
      expect(result.current.error).toBeNull()
    })

    it('inicia con loading=true al montar', () => {
      // Promise que nunca resuelve para verificar el estado inicial
      mockGetDashboardLayout.mockReturnValue(new Promise(() => {}))

      const { result } = renderHook(() => useDashboardLayout())

      expect(result.current.loading).toBe(true)
    })

    it('devuelve DEFAULT_LAYOUT si la respuesta no tiene layout array no vacío', async () => {
      mockGetDashboardLayout.mockResolvedValue({ updated_at: '2026-01-01' })

      const { result } = renderHook(() => useDashboardLayout())

      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(result.current.layout).toEqual(DEFAULT_LAYOUT)
    })

    it('devuelve DEFAULT_LAYOUT si layout es array vacío', async () => {
      mockGetDashboardLayout.mockResolvedValue({ layout: [] })

      const { result } = renderHook(() => useDashboardLayout())

      await waitFor(() => expect(result.current.loading).toBe(false))

      expect(result.current.layout).toEqual(DEFAULT_LAYOUT)
    })

    it('no llama getDashboardLayout si user.sub está vacío', async () => {
      mockUseAuth.mockReturnValue({
        user: { sub: '', email: '', name: '' } as any,
        token: 'tok-abc',
      } as any)

      const { result } = renderHook(() => useDashboardLayout())

      expect(result.current.loading).toBe(false)
      expect(result.current.layout).toEqual(DEFAULT_LAYOUT)
      await new Promise((r) => setTimeout(r, 10))
      expect(mockGetDashboardLayout).not.toHaveBeenCalled()
    })

    it('no llama getDashboardLayout si token es null', async () => {
      mockUseAuth.mockReturnValue({
        user: { sub: 'u-123', email: '', name: '' } as any,
        token: null,
      } as any)

      const { result } = renderHook(() => useDashboardLayout())

      expect(result.current.loading).toBe(false)
      expect(result.current.layout).toEqual(DEFAULT_LAYOUT)
      await new Promise((r) => setTimeout(r, 10))
      expect(mockGetDashboardLayout).not.toHaveBeenCalled()
    })

    it('no llama getDashboardLayout si user es null', async () => {
      mockUseAuth.mockReturnValue({ user: null, token: 'tok' } as any)

      renderHook(() => useDashboardLayout())

      await new Promise((r) => setTimeout(r, 10))
      expect(mockGetDashboardLayout).not.toHaveBeenCalled()
    })
  })

  // ─── Manejo de errores ──────────────────────────────────────────
  describe('errores en la carga', () => {
    it('expone error i18n key cuando el fetcher lanza Error con prefijo dashboardLayout.', async () => {
      mockGetDashboardLayout.mockRejectedValue(new Error('dashboardLayout.errorLoad'))

      const { result } = renderHook(() => useDashboardLayout())

      await waitFor(() => expect(result.current.error).not.toBeNull())

      expect(result.current.error).toBe('dashboardLayout.errorLoad')
    })

    it('expone el mensaje raw cuando el error no tiene prefijo conocido', async () => {
      mockGetDashboardLayout.mockRejectedValue(new Error('network failure'))

      const { result } = renderHook(() => useDashboardLayout())

      await waitFor(() => expect(result.current.error).not.toBeNull())

      expect(result.current.error).toBe('network failure')
    })

    it('usa fallbackKey errorLoad cuando el error no tiene mensaje', async () => {
      mockGetDashboardLayout.mockRejectedValue(new Error(''))

      const { result } = renderHook(() => useDashboardLayout())

      await waitFor(() => expect(result.current.error).not.toBeNull())

      expect(result.current.error).toBe('dashboardLayout.errorLoad')
    })

    it('layout cae a DEFAULT_LAYOUT en error de carga', async () => {
      mockGetDashboardLayout.mockRejectedValue(new Error('dashboardLayout.errorLoad'))

      const { result } = renderHook(() => useDashboardLayout())

      await waitFor(() => expect(result.current.error).not.toBeNull())

      expect(result.current.layout).toEqual(DEFAULT_LAYOUT)
    })
  })

  // ─── saveLayout ──────────────────────────────────────────────────
  describe('saveLayout', () => {
    it('llama updateDashboardLayout con userId, layout y token', async () => {
      const newLayout = [{ i: 'w-new', x: 0, y: 0, w: 12, h: 6 }]
      mockUpdateDashboardLayout.mockResolvedValue({ layout: newLayout })

      const { result } = renderHook(() => useDashboardLayout())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.saveLayout(newLayout)
      })

      expect(mockUpdateDashboardLayout).toHaveBeenCalledWith('u-123', newLayout, 'tok-abc')
    })

    it('no llama updateDashboardLayout si enabled=false (sin user.sub)', async () => {
      mockUseAuth.mockReturnValue({
        user: { sub: '', email: '', name: '' } as any,
        token: 'tok',
      } as any)

      const { result } = renderHook(() => useDashboardLayout())

      await act(async () => {
        await result.current.saveLayout([{ i: 'w', x: 0, y: 0, w: 4, h: 3 }])
      })

      expect(mockUpdateDashboardLayout).not.toHaveBeenCalled()
    })

    it('no llama updateDashboardLayout si token es null', async () => {
      mockUseAuth.mockReturnValue({
        user: { sub: 'u-123', email: '', name: '' } as any,
        token: null,
      } as any)

      const { result } = renderHook(() => useDashboardLayout())

      await act(async () => {
        await result.current.saveLayout([{ i: 'w', x: 0, y: 0, w: 4, h: 3 }])
      })

      expect(mockUpdateDashboardLayout).not.toHaveBeenCalled()
    })

    it('expone error cuando updateDashboardLayout lanza', async () => {
      mockUpdateDashboardLayout.mockRejectedValue(new Error('dashboardLayout.errorSave'))

      const { result } = renderHook(() => useDashboardLayout())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.saveLayout([{ i: 'w', x: 0, y: 0, w: 4, h: 3 }])
      })

      await waitFor(() => expect(result.current.error).not.toBeNull())
      expect(result.current.error).toBe('dashboardLayout.errorSave')
    })

    it('un error de save no rompe el flujo (no throw al caller)', async () => {
      mockUpdateDashboardLayout.mockRejectedValue(new Error('boom'))

      const { result } = renderHook(() => useDashboardLayout())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await expect(
        act(async () => { await result.current.saveLayout([]) }),
      ).resolves.not.toThrow()
    })
  })

  // ─── resetToDefault ──────────────────────────────────────────────
  describe('resetToDefault', () => {
    it('llama updateDashboardLayout con DEFAULT_LAYOUT', async () => {
      const { result } = renderHook(() => useDashboardLayout())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.resetToDefault()
      })

      expect(mockUpdateDashboardLayout).toHaveBeenCalledWith('u-123', DEFAULT_LAYOUT, 'tok-abc')
    })

    it('no llama updateDashboardLayout si enabled=false', async () => {
      mockUseAuth.mockReturnValue({ user: null, token: 'tok' } as any)

      const { result } = renderHook(() => useDashboardLayout())

      await act(async () => {
        await result.current.resetToDefault()
      })

      expect(mockUpdateDashboardLayout).not.toHaveBeenCalled()
    })
  })
})
