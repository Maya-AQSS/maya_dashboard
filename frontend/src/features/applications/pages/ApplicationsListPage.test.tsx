import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Harness post-adopción 0.16: la página consume useQuery/useQueryClient
 * (TanStack Query), useAuth (shared-auth-react), useServerTable
 * (shared-hooks-react, necesita Router por useSearchParams) y
 * useFavoritesContext. El fetch es server-side via listApplications.
 *
 * Estrategia de mocks:
 *  - Paquetes compartidos: mock PARCIAL via importOriginal — se preservan
 *    todos los exports reales (ErrorBoundary, AppErrorFallback, etc.) y solo
 *    se stubean los componentes pesados que la página renderiza.
 *  - listApplications y useFavoritesContext: mock completo del módulo local.
 *  - QueryClientProvider + MemoryRouter reales en el render.
 */
vi.mock('@ceedcv-maya/shared-ui-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ceedcv-maya/shared-ui-react')>()

  const ConfirmDialog = ({
    open,
    title,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
  }: {
    open: boolean
    title: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
  }) => {
    if (!open) return null
    return (
      <div role="dialog">
        <span>{title}</span>
        <button onClick={onConfirm}>{confirmLabel ?? 'confirm-dialog'}</button>
        <button onClick={onCancel}>{cancelLabel ?? 'cancel-dialog'}</button>
      </div>
    )
  }

  type Row = { id: string; name: string; isFavorite: boolean }

  const DataTable = ({
    rows,
    loading,
    emptyMessage,
    filtersPanel,
    onRowClick,
    columns,
    cardRender,
  }: {
    rows: Row[]
    loading?: boolean
    emptyMessage?: string
    filtersPanel?: ReactNode
    onRowClick?: (row: Row) => void
    columns?: { id: string; cell: (row: Row) => ReactNode }[]
    cardRender?: (row: Row) => ReactNode
  }) => {
    if (loading) return <div data-testid="table-loading">Cargando...</div>
    return (
      <div>
        {filtersPanel && <div data-testid="filters-panel">{filtersPanel}</div>}
        {rows.length === 0 ? (
          <div data-testid="table-empty">{emptyMessage}</div>
        ) : (
          <div data-testid="data-table">
            {rows.map((row) => (
              <div
                key={row.id}
                data-testid={`row-${row.id}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns?.map((col) => (
                  <span key={col.id}>{col.cell(row)}</span>
                ))}
                {cardRender && cardRender(row)}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const Pagination = ({
    currentPage,
    totalPages,
    info,
  }: {
    currentPage: number
    totalPages: number
    info?: string
  }) => (
    <div data-testid="pagination">
      <span>Página {currentPage} de {totalPages}</span>
      {info && <span>{info}</span>}
    </div>
  )

  const PageTitle = ({ title }: { title: string }) => <h1>{title}</h1>

  const FilterField = ({ label, children }: { label: string; children: ReactNode }) => (
    <div data-testid={`filter-field-${label}`}>{children}</div>
  )

  const TextInput = ({ fieldSize: _fieldSize, ...props }: { fieldSize?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <input data-testid="search-input" {...props} />
  )

  const Select = ({
    fieldSize: _fieldSize,
    value,
    onChange,
    children,
  }: {
    fieldSize?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    children: ReactNode
  }) => (
    <select data-testid="favorite-select" value={value} onChange={onChange}>
      {children}
    </select>
  )

  return {
    ...actual,
    ConfirmDialog,
    DataTable,
    Pagination,
    PageTitle,
    FilterField,
    TextInput,
    Select,
  }
})

vi.mock('@ceedcv-maya/shared-i18n-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ceedcv-maya/shared-i18n-react')>()
  return {
    ...actual,
    useLocale: vi.fn(),
  }
})

vi.mock('@ceedcv-maya/shared-auth-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ceedcv-maya/shared-auth-react')>()
  return {
    ...actual,
    useAuth: vi.fn(),
  }
})

vi.mock('../api/applicationsApi', () => ({
  listApplications: vi.fn(),
}))

vi.mock('../../favorites/context/FavoritesContext', () => ({
  useFavoritesContext: vi.fn(),
}))

import {
  FAVORITE_STAR_FILLED_CHAR,
  FAVORITE_STAR_OUTLINE_CHAR,
} from '@ceedcv-maya/shared-ui-react'
import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { listApplications } from '../api/applicationsApi'
import { useFavoritesContext } from '../../favorites/context/FavoritesContext'
import ApplicationsListPage from './ApplicationsListPage'

const mockUseAuth = vi.mocked(useAuth)
const mockUseLocale = vi.mocked(useLocale)
const mockListApplications = vi.mocked(listApplications)
const mockUseFavoritesContext = vi.mocked(useFavoritesContext)

const addFavoriteMock = vi.fn()
const removeFavoriteMock = vi.fn()

type App = {
  id: string
  name: string
  description: string
  documentationUrl: string
  isFavorite: boolean
}

function makeApp(overrides: Partial<App> = {}): App {
  return {
    id: 'app-1',
    name: 'App One',
    description: 'Great app',
    documentationUrl: 'https://docs.example.com',
    isFavorite: false,
    ...overrides,
  }
}

function makeMeta(overrides: Partial<{
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}> = {}) {
  return {
    total: 1,
    per_page: 15,
    current_page: 1,
    last_page: 1,
    from: 1,
    to: 1,
    ...overrides,
  }
}

function setupMocks({
  apps = [] as App[],
  meta = makeMeta(),
  user = { sub: 'user-1' } as { sub: string } | null,
} = {}) {
  mockListApplications.mockResolvedValue({ data: apps, meta })

  mockUseAuth.mockReturnValue({
    user,
    token: user ? 'token-1' : null,
  } as ReturnType<typeof useAuth>)

  mockUseLocale.mockReturnValue({
    t: (key: string) => key,
    locale: 'es',
    setLocale: vi.fn(),
    localeOptions: [],
  } as unknown as ReturnType<typeof useLocale>)

  addFavoriteMock.mockResolvedValue(undefined)
  removeFavoriteMock.mockResolvedValue(undefined)
  mockUseFavoritesContext.mockReturnValue({
    favorites: [],
    loading: false,
    error: null,
    add: addFavoriteMock,
    remove: removeFavoriteMock,
  })
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ApplicationsListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ApplicationsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    setupMocks()
  })

  describe('estado de error', () => {
    it('muestra estado vacío y no el DataTable cuando la query falla', async () => {
      setupMocks()
      mockListApplications.mockRejectedValue(new Error('applications.errorLoad'))
      renderPage()
      expect(await screen.findByTestId('table-empty')).toBeTruthy()
      expect(screen.queryByTestId('data-table')).toBeNull()
    })

    it('no llama a listApplications sin usuario autenticado', async () => {
      setupMocks({ user: null })
      renderPage()
      await waitFor(() => {
        expect(screen.queryByTestId('data-table')).toBeNull()
      })
      expect(mockListApplications).not.toHaveBeenCalled()
    })
  })

  describe('estado de carga', () => {
    it('muestra el indicador de carga mientras la query está en vuelo', () => {
      setupMocks()
      mockListApplications.mockReturnValue(new Promise(() => {}))
      renderPage()
      expect(screen.getByTestId('table-loading')).toBeTruthy()
    })
  })

  describe('lista vacía', () => {
    it('muestra mensaje de no applications cuando la lista está vacía', async () => {
      setupMocks({ apps: [], meta: makeMeta({ total: 0, from: 0, to: 0 }) })
      renderPage()
      expect(await screen.findByTestId('table-empty')).toBeTruthy()
      expect(screen.getByTestId('table-empty').textContent).toContain('applications.noApplications')
    })
  })

  describe('lista con aplicaciones', () => {
    it('muestra el nombre de cada app', async () => {
      setupMocks({
        apps: [
          makeApp({ id: '1', name: 'App Alpha' }),
          makeApp({ id: '2', name: 'App Beta' }),
        ],
      })
      renderPage()
      // Names appear in both column cell and cardRender — findAll to handle multiple matches
      expect((await screen.findAllByText('App Alpha')).length).toBeGreaterThan(0)
      expect(screen.getAllByText('App Beta').length).toBeGreaterThan(0)
    })

    it('renderiza el DataTable con las apps', async () => {
      setupMocks({ apps: [makeApp({ id: '1' })] })
      renderPage()
      expect(await screen.findByTestId('data-table')).toBeTruthy()
      expect(screen.getByTestId('row-1')).toBeTruthy()
    })

    it('muestra la paginación con los datos de meta del servidor', async () => {
      setupMocks({
        apps: [makeApp()],
        meta: makeMeta({ current_page: 2, last_page: 5, total: 70 }),
      })
      renderPage()
      await screen.findByTestId('data-table')
      expect(screen.getByTestId('pagination').textContent).toContain('Página 2 de 5')
    })
  })

  describe('favorito toggle', () => {
    it('abre el ConfirmDialog al hacer clic en el botón de favorito', async () => {
      setupMocks({
        apps: [makeApp({ id: '1', name: 'App Favorita', isFavorite: false })],
      })
      renderPage()
      await screen.findByTestId('data-table')
      const favButtons = screen.getAllByRole('button', { name: /applications\.(addToFavorites|removeFromFavorites)/ })
      fireEvent.click(favButtons[0])
      expect(screen.getByRole('dialog')).toBeTruthy()
    })

    it('llama a add del contexto de favoritos al confirmar sobre una app no favorita', async () => {
      setupMocks({
        apps: [makeApp({ id: 'app-99', name: 'Confirmada', isFavorite: false })],
      })
      renderPage()
      await screen.findByTestId('data-table')
      const favButtons = screen.getAllByRole('button', { name: /applications\.addToFavorites/ })
      fireEvent.click(favButtons[0])
      fireEvent.click(screen.getByText('actions.confirm'))
      await waitFor(() => {
        expect(addFavoriteMock).toHaveBeenCalledWith('app-99')
      })
      expect(removeFavoriteMock).not.toHaveBeenCalled()
    })

    it('llama a remove del contexto de favoritos al confirmar sobre una app favorita', async () => {
      setupMocks({
        apps: [makeApp({ id: 'app-7', name: 'Quitada', isFavorite: true })],
      })
      renderPage()
      await screen.findByTestId('data-table')
      const favButtons = screen.getAllByRole('button', { name: /applications\.removeFromFavorites/ })
      fireEvent.click(favButtons[0])
      fireEvent.click(screen.getByText('actions.confirm'))
      await waitFor(() => {
        expect(removeFavoriteMock).toHaveBeenCalledWith('app-7')
      })
      expect(addFavoriteMock).not.toHaveBeenCalled()
    })

    it('cierra el diálogo al cancelar sin tocar el contexto de favoritos', async () => {
      setupMocks({
        apps: [makeApp({ id: '1', name: 'App', isFavorite: false })],
      })
      renderPage()
      await screen.findByTestId('data-table')
      const favButtons = screen.getAllByRole('button', { name: /applications\.addToFavorites/ })
      fireEvent.click(favButtons[0])
      fireEvent.click(screen.getByText('actions.cancel'))
      expect(addFavoriteMock).not.toHaveBeenCalled()
      expect(removeFavoriteMock).not.toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('muestra la estrella filled para apps favoritas', async () => {
      setupMocks({
        apps: [makeApp({ id: '1', name: 'Fav App', isFavorite: true })],
      })
      renderPage()
      await screen.findByTestId('data-table')
      expect(screen.getAllByText(FAVORITE_STAR_FILLED_CHAR).length).toBeGreaterThan(0)
    })

    it('muestra la estrella outline para apps no favoritas', async () => {
      setupMocks({
        apps: [makeApp({ id: '1', name: 'Non Fav', isFavorite: false })],
      })
      renderPage()
      await screen.findByTestId('data-table')
      expect(screen.getAllByText(FAVORITE_STAR_OUTLINE_CHAR).length).toBeGreaterThan(0)
    })
  })

  describe('título de página', () => {
    it('muestra el título de aplicaciones', async () => {
      setupMocks()
      renderPage()
      expect(await screen.findByText('nav.applications')).toBeTruthy()
    })
  })

  // ─── Filtros server-side ────────────────────────────────────────────────
  // Tras la adopción 0.16 el filtrado vive en el backend: cambiar un filtro
  // actualiza useServerTable.queryParams y dispara una nueva llamada a
  // listApplications con esos params. Se asierta el contrato con la API,
  // no el filtrado en cliente.

  describe('filtros server-side', () => {
    it('la carga inicial pide la página 1 con el orden por defecto y sin filtros', async () => {
      setupMocks({ apps: [makeApp()] })
      renderPage()
      await screen.findByTestId('data-table')
      expect(mockListApplications).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          page: 1,
          sort_by: 'name',
          sort_dir: 'asc',
          search: undefined,
          favorite: undefined,
        }),
      )
    })

    it('escribir en la búsqueda (con debounce) pide al servidor con search', async () => {
      setupMocks({ apps: [makeApp({ id: '1', name: 'Alpha Service' })] })
      renderPage()
      await screen.findByTestId('data-table')

      fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'alpha' } })
      // Debounce de 400ms en la página antes de propagar el filtro
      await act(async () => {
        await new Promise((r) => setTimeout(r, 450))
      })

      await waitFor(() => {
        expect(mockListApplications).toHaveBeenCalledWith(
          'user-1',
          expect.objectContaining({ search: 'alpha', page: 1 }),
        )
      })
    })

    it('seleccionar favoritas pide al servidor con favorite=yes', async () => {
      setupMocks({ apps: [makeApp({ id: '1', name: 'Favorita', isFavorite: true })] })
      renderPage()
      await screen.findByTestId('data-table')

      fireEvent.change(screen.getByTestId('favorite-select'), { target: { value: 'yes' } })

      await waitFor(() => {
        expect(mockListApplications).toHaveBeenCalledWith(
          'user-1',
          expect.objectContaining({ favorite: 'yes', page: 1 }),
        )
      })
    })

    it('seleccionar no favoritas pide al servidor con favorite=no', async () => {
      setupMocks({ apps: [makeApp({ id: '2', name: 'Normal', isFavorite: false })] })
      renderPage()
      await screen.findByTestId('data-table')

      fireEvent.change(screen.getByTestId('favorite-select'), { target: { value: 'no' } })

      await waitFor(() => {
        expect(mockListApplications).toHaveBeenCalledWith(
          'user-1',
          expect.objectContaining({ favorite: 'no', page: 1 }),
        )
      })
    })
  })
})
