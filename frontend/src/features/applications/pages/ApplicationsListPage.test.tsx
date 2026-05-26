import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

vi.mock('../hooks/useApplicationsData', () => ({
  default: vi.fn(),
}))

vi.mock('@ceedcv-maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('@ceedcv-maya/shared-ui-react', () => {
  const ConfirmDialog = ({
    open,
    title,
    onConfirm,
    onCancel,
  }: {
    open: boolean
    title: string
    onConfirm: () => void
    onCancel: () => void
  }) => {
    if (!open) return null
    return (
      <div role="dialog">
        <span>{title}</span>
        <button onClick={onConfirm}>confirm-dialog</button>
        <button onClick={onCancel}>cancel-dialog</button>
      </div>
    )
  }

  const DataTable = ({
    rows,
    loading,
    emptyMessage,
    filtersPanel,
    onRowClick,
    columns,
    cardRender,
  }: {
    rows: { id: string; name: string; isFavorite: boolean; documentationUrl?: string }[]
    loading?: boolean
    emptyMessage?: string
    filtersPanel?: React.ReactNode
    onRowClick?: (row: { id: string; name: string; isFavorite: boolean; documentationUrl?: string }) => void
    columns?: { id: string; header: string; cell: (row: any) => React.ReactNode }[]
    cardRender?: (row: any) => React.ReactNode
  }) => {
    if (loading) return <div data-testid="table-loading">Cargando...</div>
    if (!rows.length) return <div data-testid="table-empty">{emptyMessage}</div>
    return (
      <div data-testid="data-table">
        {filtersPanel && <div data-testid="filters-panel">{filtersPanel}</div>}
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
    )
  }

  const Pagination = ({
    currentPage,
    totalPages,
    onChange,
  }: {
    currentPage: number
    totalPages: number
    onChange: (p: number) => void
  }) => (
    <div data-testid="pagination">
      <span>Página {currentPage} de {totalPages}</span>
      <button onClick={() => onChange(currentPage + 1)}>Siguiente</button>
    </div>
  )

  const PageTitle = ({ title }: { title: string }) => <h1>{title}</h1>

  const FilterField = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div data-testid={`filter-field-${label}`}>{children}</div>
  )

  const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input data-testid="search-input" {...props} />
  )

  const Select = ({
    value,
    onChange,
    children,
  }: {
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    children: React.ReactNode
  }) => (
    <select data-testid="favorite-select" value={value} onChange={onChange}>
      {children}
    </select>
  )

  const useTablePreferences = () => ({
    hiddenIds: [],
    toggleHidden: vi.fn(),
    sortBy: undefined,
    setSortBy: vi.fn(),
    pageSize: 20,
    setPageSize: vi.fn(),
  })

  return {
    ConfirmDialog,
    DataTable,
    Pagination,
    PageTitle,
    FilterField,
    TextInput,
    Select,
    useTablePreferences,
    FAVORITE_STAR_FILLED_CHAR: '★',
    FAVORITE_STAR_OUTLINE_CHAR: '☆',
  }
})

import useApplicationsData from '../hooks/useApplicationsData'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import ApplicationsListPage from './ApplicationsListPage'

const mockUseApplicationsData = vi.mocked(useApplicationsData)
const mockUseLocale = vi.mocked(useLocale)
const toggleFavoriteMock = vi.fn()

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

function setupMocks({
  apps = [] as App[],
  loading = false,
  error = null as string | null,
} = {}) {
  mockUseApplicationsData.mockReturnValue({
    apps,
    loading,
    error,
    toggleFavorite: toggleFavoriteMock,
  })

  mockUseLocale.mockReturnValue({
    t: (key: string) => key,
    locale: 'es',
    setLocale: vi.fn(),
    localeOptions: [],
  } as any)
}

describe('ApplicationsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('estado de error', () => {
    it('muestra role=alert cuando hay error', () => {
      setupMocks({ error: 'applications.errorLoad' })
      render(<ApplicationsListPage />)
      expect(screen.getByRole('alert')).toBeTruthy()
      expect(screen.getByRole('alert').textContent).toContain('applications.errorLoad')
    })

    it('no muestra el DataTable cuando hay error', () => {
      setupMocks({ error: 'Error de carga' })
      render(<ApplicationsListPage />)
      expect(screen.queryByTestId('data-table')).toBeNull()
    })
  })

  describe('estado de carga', () => {
    it('muestra el spinner de carga cuando loading es true y apps vacío', () => {
      setupMocks({ loading: true, apps: [] })
      render(<ApplicationsListPage />)
      expect(screen.getByTestId('table-loading')).toBeTruthy()
    })
  })

  describe('lista vacía', () => {
    it('muestra mensaje de no applications cuando lista está vacía', () => {
      setupMocks({ apps: [] })
      render(<ApplicationsListPage />)
      expect(screen.getByTestId('table-empty')).toBeTruthy()
      expect(screen.getByTestId('table-empty').textContent).toContain('applications.noApplications')
    })
  })

  describe('lista con aplicaciones', () => {
    it('muestra el nombre de cada app', () => {
      setupMocks({
        apps: [
          makeApp({ id: '1', name: 'App Alpha' }),
          makeApp({ id: '2', name: 'App Beta' }),
        ],
      })
      render(<ApplicationsListPage />)
      // Names appear in both column cell and cardRender — getAllByText to handle multiple matches
      expect(screen.getAllByText('App Alpha').length).toBeGreaterThan(0)
      expect(screen.getAllByText('App Beta').length).toBeGreaterThan(0)
    })

    it('renderiza el DataTable con las apps', () => {
      setupMocks({ apps: [makeApp({ id: '1' })] })
      render(<ApplicationsListPage />)
      expect(screen.getByTestId('data-table')).toBeTruthy()
      expect(screen.getByTestId('row-1')).toBeTruthy()
    })

    it('muestra la paginación', () => {
      setupMocks({ apps: [makeApp()] })
      render(<ApplicationsListPage />)
      expect(screen.getByTestId('pagination')).toBeTruthy()
    })
  })

  describe('favorito toggle', () => {
    it('abre el ConfirmDialog al hacer clic en el botón de favorito', () => {
      setupMocks({
        apps: [makeApp({ id: '1', name: 'App Favorita', isFavorite: false })],
      })
      render(<ApplicationsListPage />)
      // Find the favorite button (★ or ☆) — rendered via column cell or cardRender
      const favButtons = screen.getAllByRole('button', { name: /applications\.(addToFavorites|removeFromFavorites)/ })
      fireEvent.click(favButtons[0])
      expect(screen.getByRole('dialog')).toBeTruthy()
    })

    it('llama a toggleFavorite con el id al confirmar el diálogo', () => {
      setupMocks({
        apps: [makeApp({ id: 'app-99', name: 'Confirmada', isFavorite: false })],
      })
      render(<ApplicationsListPage />)
      const favButtons = screen.getAllByRole('button', { name: /applications\.(addToFavorites|removeFromFavorites)/ })
      fireEvent.click(favButtons[0])
      fireEvent.click(screen.getByText('confirm-dialog'))
      expect(toggleFavoriteMock).toHaveBeenCalledWith('app-99')
    })

    it('cierra el diálogo al cancelar sin llamar a toggleFavorite', () => {
      setupMocks({
        apps: [makeApp({ id: '1', name: 'App', isFavorite: false })],
      })
      render(<ApplicationsListPage />)
      const favButtons = screen.getAllByRole('button', { name: /applications\.(addToFavorites|removeFromFavorites)/ })
      fireEvent.click(favButtons[0])
      fireEvent.click(screen.getByText('cancel-dialog'))
      expect(toggleFavoriteMock).not.toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('muestra la estrella filled para apps favoritas', () => {
      setupMocks({
        apps: [makeApp({ id: '1', name: 'Fav App', isFavorite: true })],
      })
      render(<ApplicationsListPage />)
      expect(screen.getAllByText('★').length).toBeGreaterThan(0)
    })

    it('muestra la estrella outline para apps no favoritas', () => {
      setupMocks({
        apps: [makeApp({ id: '1', name: 'Non Fav', isFavorite: false })],
      })
      render(<ApplicationsListPage />)
      expect(screen.getAllByText('☆').length).toBeGreaterThan(0)
    })
  })

  describe('título de página', () => {
    it('muestra el título de aplicaciones', () => {
      setupMocks()
      render(<ApplicationsListPage />)
      expect(screen.getByText('applications.title')).toBeTruthy()
    })
  })
})

// ─── applyFilters pure function tests ────────────────────────────────────────
// These test the internal function's behavior indirectly through the component,
// but since it's not exported, we test it via integration with the component.

describe('applyFilters (integración vía componente)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseLocale.mockReturnValue({
      t: (key: string) => key,
      locale: 'es',
      setLocale: vi.fn(),
      localeOptions: [],
    } as any)
  })

  it('filtra por búsqueda en nombre', async () => {
    mockUseApplicationsData.mockReturnValue({
      apps: [
        makeApp({ id: '1', name: 'Alpha Service', description: '' }),
        makeApp({ id: '2', name: 'Beta Platform', description: '' }),
      ],
      loading: false,
      error: null,
      toggleFavorite: toggleFavoriteMock,
    })
    render(<ApplicationsListPage />)

    const searchInput = screen.getByTestId('search-input')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'alpha' } })
      await new Promise((r) => setTimeout(r, 500))
    })

    // Names appear in both column cell and cardRender — use getAllByText to handle duplicates
    expect(screen.getAllByText('Alpha Service').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('Beta Platform')).toHaveLength(0)
  })

  it('filtra por búsqueda en descripción', async () => {
    mockUseApplicationsData.mockReturnValue({
      apps: [
        makeApp({ id: '1', name: 'App One', description: 'facturación mensual' }),
        makeApp({ id: '2', name: 'App Two', description: 'gestión de usuarios' }),
      ],
      loading: false,
      error: null,
      toggleFavorite: toggleFavoriteMock,
    })
    render(<ApplicationsListPage />)

    const searchInput = screen.getByTestId('search-input')
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'facturación' } })
      await new Promise((r) => setTimeout(r, 500))
    })

    expect(screen.getAllByText('App One').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('App Two')).toHaveLength(0)
  })

  it('filtra por estado favorito = yes', () => {
    mockUseApplicationsData.mockReturnValue({
      apps: [
        makeApp({ id: '1', name: 'Favorita', isFavorite: true }),
        makeApp({ id: '2', name: 'Normal', isFavorite: false }),
      ],
      loading: false,
      error: null,
      toggleFavorite: toggleFavoriteMock,
    })
    render(<ApplicationsListPage />)

    const select = screen.getByTestId('favorite-select')
    fireEvent.change(select, { target: { value: 'yes' } })

    expect(screen.getAllByText('Favorita').length).toBeGreaterThan(0)
    expect(screen.queryAllByText('Normal')).toHaveLength(0)
  })

  it('filtra por estado favorito = no', () => {
    mockUseApplicationsData.mockReturnValue({
      apps: [
        makeApp({ id: '1', name: 'Favorita', isFavorite: true }),
        makeApp({ id: '2', name: 'Normal', isFavorite: false }),
      ],
      loading: false,
      error: null,
      toggleFavorite: toggleFavoriteMock,
    })
    render(<ApplicationsListPage />)

    const select = screen.getByTestId('favorite-select')
    fireEvent.change(select, { target: { value: 'no' } })

    expect(screen.queryAllByText('Favorita')).toHaveLength(0)
    expect(screen.getAllByText('Normal').length).toBeGreaterThan(0)
  })

  it('muestra todas las apps cuando favorite = ""', () => {
    mockUseApplicationsData.mockReturnValue({
      apps: [
        makeApp({ id: '1', name: 'Favorita', isFavorite: true }),
        makeApp({ id: '2', name: 'Normal', isFavorite: false }),
      ],
      loading: false,
      error: null,
      toggleFavorite: toggleFavoriteMock,
    })
    render(<ApplicationsListPage />)

    const select = screen.getByTestId('favorite-select')
    fireEvent.change(select, { target: { value: '' } })

    expect(screen.getAllByText('Favorita').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Normal').length).toBeGreaterThan(0)
  })
})
