import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { createElement, useState, useEffect, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * FavoritesContext calls createDataHook / createMutationHook at MODULE LEVEL.
 * We must provide implementations in the vi.mock factory that return real hook
 * factories — these run during module resolution, before any test setup.
 *
 * Strategy: avoid @tanstack/react-query internals in the mock entirely.
 * Use React useState/useEffect to simulate query/mutation behavior.
 * The real QueryClientProvider is still needed for useQueryClient() inside
 * FavoritesProvider (used for optimistic updates).
 */
vi.mock('@maya/shared-auth-react', () => {
  return {
    useAuth: vi.fn(),
    /**
     * createDataHook(config) → returns a hook factory.
     * We simulate useQuery behavior with useState+useEffect — no TanStack
     * internals, so no "No QueryClient set" error.
     */
    createDataHook: vi.fn((config: any) => {
      return (params: any, options: any = {}) => {
        const [state, setState] = useState<{
          data: any
          isLoading: boolean
          error: Error | null
        }>({ data: undefined, isLoading: true, error: null })

        useEffect(() => {
          const enabled = options?.enabled !== false
          if (!enabled) {
            setState({ data: undefined, isLoading: false, error: null })
            return
          }

          let cancelled = false
          setState((s) => ({ ...s, isLoading: true, error: null }))

          config
            .fetcher(params)
            .then((result: any) => {
              if (!cancelled) {
                setState({ data: result, isLoading: false, error: null })
              }
            })
            .catch((err: Error) => {
              if (!cancelled) {
                setState({ data: undefined, isLoading: false, error: err })
              }
            })

          return () => {
            cancelled = true
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [JSON.stringify(config.queryKey(params)), options?.enabled])

        return { ...state }
      }
    }),
    /**
     * createMutationHook(config) → returns a hook factory.
     * We simulate useMutation behavior with useState.
     */
    createMutationHook: vi.fn((config: any) => {
      return () => {
        const [isPending, setIsPending] = useState(false)

        const mutateAsync = async (variables: any) => {
          setIsPending(true)
          try {
            const result = await config.mutationFn(variables)
            setIsPending(false)
            return result
          } catch (err) {
            setIsPending(false)
            throw err
          }
        }

        return { mutateAsync, isPending }
      }
    }),
  }
})

vi.mock('@maya/shared-sidebar-react', () => ({
  notifyFavoritesChanged: vi.fn(),
}))

vi.mock('../api/favoritesApi', () => ({
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}))

import { useAuth } from '@maya/shared-auth-react'
import { notifyFavoritesChanged } from '@maya/shared-sidebar-react'
import { getFavorites, addFavorite, removeFavorite } from '../api/favoritesApi'
import { FavoritesProvider, useFavoritesContext } from './FavoritesContext'

const mockUseAuth = vi.mocked(useAuth)
const mockGetFavorites = vi.mocked(getFavorites)
const mockAddFavorite = vi.mocked(addFavorite)
const mockRemoveFavorite = vi.mocked(removeFavorite)
const mockNotifyFavoritesChanged = vi.mocked(notifyFavoritesChanged)

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  })
}

function makeWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: qc },
      createElement(FavoritesProvider, null, children),
    )
  }
}

function FavoritesDisplay() {
  const { favorites, loading, error } = useFavoritesContext()
  return (
    <div>
      <span data-testid="count">{favorites.length}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? 'null'}</span>
    </div>
  )
}

describe('FavoritesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ── useFavoritesContext guard ────────────────────────────────────────
  describe('useFavoritesContext fuera del Provider', () => {
    it('lanza error cuando no hay Provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      expect(() => render(<FavoritesDisplay />)).toThrow(
        'useFavoritesContext must be inside FavoritesProvider',
      )
      consoleSpy.mockRestore()
    })
  })

  // ── sin autenticar ───────────────────────────────────────────────────
  describe('sin usuario autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ token: null, user: null } as any)
    })

    it('devuelve favorites vacío', () => {
      const qc = makeClient()
      render(<FavoritesDisplay />, { wrapper: makeWrapper(qc) })
      expect(screen.getByTestId('count').textContent).toBe('0')
    })

    it('devuelve loading=false', async () => {
      const qc = makeClient()
      render(<FavoritesDisplay />, { wrapper: makeWrapper(qc) })
      await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('false')
      }, { timeout: 3000 })
    })

    it('devuelve error=null', () => {
      const qc = makeClient()
      render(<FavoritesDisplay />, { wrapper: makeWrapper(qc) })
      expect(screen.getByTestId('error').textContent).toBe('null')
    })
  })

  // ── con usuario autenticado ─────────────────────────────────────────
  describe('con usuario autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ token: 'tok-123', user: { sub: 'u1' } } as any)
    })

    it('obtiene favorites y los expone', async () => {
      mockGetFavorites.mockResolvedValue([{ id: '1', name: 'App1' }, { id: '2' }] as any)
      const qc = makeClient()
      render(<FavoritesDisplay />, { wrapper: makeWrapper(qc) })

      await waitFor(() => {
        expect(screen.getByTestId('count').textContent).toBe('2')
      }, { timeout: 5000 })
    })

    it('llama getFavorites con userId y token', async () => {
      mockGetFavorites.mockResolvedValue([])
      const qc = makeClient()
      render(<FavoritesDisplay />, { wrapper: makeWrapper(qc) })

      await waitFor(() => {
        expect(mockGetFavorites).toHaveBeenCalledWith('u1', 'tok-123')
      }, { timeout: 5000 })
    })

    it('expone error cuando getFavorites falla', async () => {
      mockGetFavorites.mockRejectedValue(new Error('favorites.errorLoad'))
      const qc = makeClient()
      render(<FavoritesDisplay />, { wrapper: makeWrapper(qc) })

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).not.toBe('null')
      }, { timeout: 5000 })
    })
  })

  // ── add() con optimistic update ─────────────────────────────────────
  describe('add() — optimistic update', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ token: 'tok-123', user: { sub: 'u1' } } as any)
    })

    it('llama addFavorite con los parámetros correctos', async () => {
      mockGetFavorites.mockResolvedValue([])
      mockAddFavorite.mockResolvedValue({ id: '5', name: 'New' } as any)

      let contextRef: ReturnType<typeof useFavoritesContext> | null = null

      function Consumer() {
        contextRef = useFavoritesContext()
        return <span data-testid="count">{contextRef.favorites.length}</span>
      }

      const qc = makeClient()
      render(
        createElement(QueryClientProvider, { client: qc },
          createElement(FavoritesProvider, null, createElement(Consumer))),
      )

      await waitFor(() => expect(mockGetFavorites).toHaveBeenCalled(), { timeout: 5000 })

      await act(async () => {
        await contextRef!.add('5')
      })

      expect(mockAddFavorite).toHaveBeenCalledWith('u1', '5', 'tok-123')
      expect(mockNotifyFavoritesChanged).toHaveBeenCalled()
    })

    it('no llama addFavorite si el id ya existe en caché', async () => {
      mockGetFavorites.mockResolvedValue([{ id: '5' }] as any)
      mockAddFavorite.mockResolvedValue({ id: '5', name: 'Existing' } as any)

      let contextRef: ReturnType<typeof useFavoritesContext> | null = null

      function Consumer() {
        contextRef = useFavoritesContext()
        return <span data-testid="count">{contextRef.favorites.length}</span>
      }

      const qc = makeClient()
      render(
        createElement(QueryClientProvider, { client: qc },
          createElement(FavoritesProvider, null, createElement(Consumer))),
      )

      await waitFor(() => {
        expect(screen.getByTestId('count').textContent).toBe('1')
      }, { timeout: 5000 })

      // The duplicate check in FavoritesProvider.add() reads from the QueryClient
      // cache via queryClient.getQueryData(). We need to pre-populate it so the
      // duplicate guard fires. The cache key is ['favorites', userId].
      qc.setQueryData(['favorites', 'u1'], [{ id: '5' }])

      await act(async () => {
        await contextRef!.add('5')
      })

      expect(mockAddFavorite).not.toHaveBeenCalled()
    })

    it('hace rollback cuando addFavorite lanza error', async () => {
      mockGetFavorites.mockResolvedValue([{ id: '1' }] as any)
      mockAddFavorite.mockRejectedValue(new Error('server error'))

      let contextRef: ReturnType<typeof useFavoritesContext> | null = null

      function Consumer() {
        contextRef = useFavoritesContext()
        return <span data-testid="count">{contextRef.favorites.length}</span>
      }

      const qc = makeClient()
      render(
        createElement(QueryClientProvider, { client: qc },
          createElement(FavoritesProvider, null, createElement(Consumer))),
      )

      await waitFor(() => {
        expect(screen.getByTestId('count').textContent).toBe('1')
      }, { timeout: 5000 })

      await act(async () => {
        await contextRef!.add('99')
      })

      // After rollback, favorites should be back to original 1
      await waitFor(() => {
        expect(contextRef!.favorites.length).toBe(1)
      }, { timeout: 5000 })
    })
  })

  // ── remove() con optimistic update ──────────────────────────────────
  describe('remove() — optimistic update', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ token: 'tok-123', user: { sub: 'u1' } } as any)
    })

    it('llama removeFavorite con los parámetros correctos', async () => {
      mockGetFavorites.mockResolvedValue([{ id: '3', name: 'App3' }] as any)
      mockRemoveFavorite.mockResolvedValue(undefined as any)

      let contextRef: ReturnType<typeof useFavoritesContext> | null = null

      function Consumer() {
        contextRef = useFavoritesContext()
        return <span data-testid="count">{contextRef.favorites.length}</span>
      }

      const qc = makeClient()
      render(
        createElement(QueryClientProvider, { client: qc },
          createElement(FavoritesProvider, null, createElement(Consumer))),
      )

      await waitFor(() => {
        expect(screen.getByTestId('count').textContent).toBe('1')
      }, { timeout: 5000 })

      await act(async () => {
        await contextRef!.remove('3')
      })

      expect(mockRemoveFavorite).toHaveBeenCalledWith('u1', '3', 'tok-123')
      expect(mockNotifyFavoritesChanged).toHaveBeenCalled()
    })

    it('hace rollback cuando removeFavorite lanza error', async () => {
      mockGetFavorites.mockResolvedValue([{ id: '3', name: 'App3' }] as any)
      mockRemoveFavorite.mockRejectedValue(new Error('server error'))

      let contextRef: ReturnType<typeof useFavoritesContext> | null = null

      function Consumer() {
        contextRef = useFavoritesContext()
        return <span data-testid="count">{contextRef.favorites.length}</span>
      }

      const qc = makeClient()
      render(
        createElement(QueryClientProvider, { client: qc },
          createElement(FavoritesProvider, null, createElement(Consumer))),
      )

      await waitFor(() => {
        expect(screen.getByTestId('count').textContent).toBe('1')
      }, { timeout: 5000 })

      await act(async () => {
        await contextRef!.remove('3')
      })

      // After rollback, the item should be restored
      await waitFor(() => {
        expect(contextRef!.favorites.length).toBe(1)
      }, { timeout: 5000 })
    })
  })
})
