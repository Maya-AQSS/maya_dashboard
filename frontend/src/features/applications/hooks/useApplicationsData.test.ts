import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@ceedcv-maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
  // 0.16.0: módulos locales (peerService/oidcAdapter/http) re-exportan del
  // paquete; el mock debe stubear lo que se evalúa al importar el hook.
  peerOrigin: vi.fn(() => 'https://dashboard-api.maya.test'),
  resolveServiceUrl: vi.fn(() => 'https://dashboard-api.maya.test'),
  createOidcAdapter: vi.fn(() => ({
    oidcAuthService: { keycloak: {} },
    appendBearerAuthorization: vi.fn(),
    triggerSignIn: vi.fn(),
  })),
  createServiceApiClient: vi.fn(() => ({
    apiFetchJson: vi.fn(),
    apiGetJson: vi.fn(),
    buildApiUrl: vi.fn(),
    getBearerToken: vi.fn(),
  })),
  mapApiError: vi.fn((_e: unknown, p: string, s = 'errorLoad') => new Error(`${p}.${s}`)),
  ApiHttpError: class ApiHttpError extends Error {},
}))

vi.mock('@ceedcv-maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('../api/applicationsApi', () => ({
  listApplications: vi.fn(),
}))

vi.mock('../../favorites/context/FavoritesContext', () => ({
  useFavoritesContext: vi.fn(),
}))

// El hook consume useUserProfile (contexto real del paquete); sin provider en
// el wrapper lanzaría. hasPermission=true deja pasar todos los viewPermission.
vi.mock('../../user-profile', () => ({
  useUserProfile: vi.fn(() => ({
    profile: null,
    loading: false,
    error: null,
    refresh: vi.fn(),
    hasPermission: vi.fn(() => true),
  })),
}))

import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { listApplications } from '../api/applicationsApi'
import { useFavoritesContext } from '../../favorites/context/FavoritesContext'
import useApplicationsData from './useApplicationsData'

const mockUseAuth = vi.mocked(useAuth)
const mockUseLocale = vi.mocked(useLocale)
const mockListApplications = vi.mocked(listApplications)
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
      mockListApplications.mockResolvedValueOnce({ data: [app1] } as any)
      const qc = makeClient()
      const { result } = renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })

      expect(result.current.apps).toHaveLength(1)
      expect(result.current.apps[0].id).toBe('1')
      expect(result.current.error).toBeNull()
    })

    it('devuelve isFavorite=true cuando el id está en favorites', async () => {
      mockListApplications.mockResolvedValueOnce({ data: [app1] } as any)
      setupMocks({ favorites: [{ id: '1' }] })
      const qc = makeClient()
      const { result } = renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })

      expect(result.current.apps[0].isFavorite).toBe(true)
    })

    it('devuelve isFavorite=false cuando el id NO está en favorites', async () => {
      mockListApplications.mockResolvedValueOnce({ data: [app1] } as any)
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
      mockListApplications.mockRejectedValue(err)
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
      mockListApplications.mockRejectedValue('string error')
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
      mockListApplications.mockResolvedValueOnce({ data: [] } as any)
      const qc = makeClient()
      renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      expect(mockListApplications).not.toHaveBeenCalled()
    })
  })

  describe('toggleFavorite', () => {
    it('llama a add cuando el app no es favorito', async () => {
      mockListApplications.mockResolvedValueOnce({ data: [app1] } as any)
      const qc = makeClient()
      const { result } = renderHook(() => useApplicationsData(), { wrapper: makeWrapper(qc) })

      await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 5000 })

      result.current.toggleFavorite('1')

      expect(addMock).toHaveBeenCalledWith('1')
      expect(removeMock).not.toHaveBeenCalled()
    })

    it('llama a remove cuando el app ya es favorito', async () => {
      mockListApplications.mockResolvedValueOnce({ data: [app1] } as any)
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
