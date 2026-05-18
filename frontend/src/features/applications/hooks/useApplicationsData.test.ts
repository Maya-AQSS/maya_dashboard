import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('../api/applicationsApi', () => ({
  getApplicationsData: vi.fn(),
}))

vi.mock('../../favorites/context/FavoritesContext', () => ({
  useFavoritesContext: vi.fn(),
}))

import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import { getApplicationsData } from '../api/applicationsApi'
import { useFavoritesContext } from '../../favorites/context/FavoritesContext'
import useApplicationsData from './useApplicationsData'

const mockUseAuth = vi.mocked(useAuth)
const mockUseLocale = vi.mocked(useLocale)
const mockGetApplicationsData = vi.mocked(getApplicationsData)
const mockUseFavoritesContext = vi.mocked(useFavoritesContext)

const addMock = vi.fn()
const removeMock = vi.fn()

function makeWrapper(qc: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
  }
}

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
}

const app1 = {
  id: '1',
  name: 'App One',
  description: 'Desc',
  url: 'https://app1.maya.test',
  category: 'aplicacion',
  isFavorite: false,
  lastUsed: null,
}

function setupMocks({
  token = 'tok',
  user = { sub: 'u1' } as any,
  favorites = [] as { id: string | number }[],
} = {}) {
  mockUseAuth.mockReturnValue({ token, user } as any)
  mockUseLocale.mockReturnValue({ t: (k: string) => k, locale: 'es', setLocale: vi.fn(), localeOptions: [] } as any)
  mockUseFavoritesContext.mockReturnValue({ favorites, loading: false, error: null, add: addMock, remove: removeMock })
}

describe('useApplicationsData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('estado inicial y carga de datos', () => {
    it('devuelve apps mapeadas desde el API', async () => {
      mockGetApplicationsData.mockResolvedValueOnce({ applications: [app1] } as any)
      const qc = makeClient()
      const { result } = renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })

      expect(result.current.apps).toHaveLength(1)
      expect(result.current.apps[0].id).toBe('1')
      expect(result.current.error).toBeNull()
    })

    it('devuelve isFavorite=true cuando el id está en favorites', async () => {
      mockGetApplicationsData.mockResolvedValueOnce({ applications: [app1] } as any)
      setupMocks({ favorites: [{ id: '1' }] })
      const qc = makeClient()
      const { result } = renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })

      expect(result.current.apps[0].isFavorite).toBe(true)
    })

    it('devuelve isFavorite=false cuando el id NO está en favorites', async () => {
      mockGetApplicationsData.mockResolvedValueOnce({ applications: [app1] } as any)
      setupMocks({ favorites: [{ id: '99' }] })
      const qc = makeClient()
      const { result } = renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })

      expect(result.current.apps[0].isFavorite).toBe(false)
    })
  })

  describe('manejo de errores', () => {
    it('cuando la query falla con Error, devuelve el message', async () => {
      // Use retry: false client so mock doesn't need to cover retries
      const err = new Error('applications.errorLoad')
      mockGetApplicationsData.mockRejectedValue(err)
      const qc = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      })
      const { result } = renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.error).not.toBeNull(), { timeout: 5000 })

      expect(result.current.error).toBe('applications.errorLoad')
      expect(result.current.apps).toHaveLength(0)
    })

    it('cuando la query falla con valor no-Error, usa t("applications.errorLoad")', async () => {
      // Rejecting with a non-Error — hook uses `t('applications.errorLoad')`
      mockGetApplicationsData.mockRejectedValue('string error')
      const qc = new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      })
      const { result } = renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.error).not.toBeNull(), { timeout: 5000 })

      expect(result.current.error).toBe('applications.errorLoad')
    })
  })

  describe('sin autenticar', () => {
    it('no ejecuta la query cuando token es null', () => {
      setupMocks({ token: null as any, user: null as any })
      mockGetApplicationsData.mockResolvedValueOnce({ applications: [] } as any)
      const qc = makeClient()
      renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      expect(mockGetApplicationsData).not.toHaveBeenCalled()
    })
  })

  describe('toggleFavorite', () => {
    it('llama a add cuando el app no es favorito', async () => {
      mockGetApplicationsData.mockResolvedValueOnce({ applications: [app1] } as any)
      const qc = makeClient()
      const { result } = renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })

      result.current.toggleFavorite('1')

      expect(addMock).toHaveBeenCalledWith('1')
      expect(removeMock).not.toHaveBeenCalled()
    })

    it('llama a remove cuando el app ya es favorito', async () => {
      mockGetApplicationsData.mockResolvedValueOnce({ applications: [app1] } as any)
      setupMocks({ favorites: [{ id: '1' }] })
      const qc = makeClient()
      const { result } = renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })

      result.current.toggleFavorite('1')

      expect(removeMock).toHaveBeenCalledWith('1')
      expect(addMock).not.toHaveBeenCalled()
    })
  })
})
