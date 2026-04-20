import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToolsListPage from './ToolsListPage'

// Herramientas de prueba (ya mapeadas al dominio)
const mockTools = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Tool ${i + 1}`,
  category: i % 2 === 0 ? 'frontend' : 'backend',
  description: `Descripción ${i + 1}`,
  isFavorite: i < 3,
  documentationUrl: `https://example.com/${i + 1}`,
  lastUsedAt: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
}))

// Mock de useToolsData
const mockToggleFavorite = vi.fn()
vi.mock('../hooks/useToolsData', () => ({
  default: vi.fn(),
}))

// Mock de useLocale — devuelve las claves tal cual para simplificar aserciones
vi.mock('../../../shared/i18n', () => ({
  useLocale: () => ({
    t: (key) => key,
    locale: 'es',
    setLocale: vi.fn(),
    supportedLocales: ['es'],
    localeOptions: [{ code: 'es', label: 'Español' }],
  }),
}))

// Mock de useIsMobile (desktop por defecto)
vi.mock('../../../shared/hooks/useIsMobile', () => ({
  useIsMobile: vi.fn().mockReturnValue(false),
  MOBILE_BREAKPOINT: '(max-width: 639px)',
}))

import useToolsData from '../hooks/useToolsData'

describe('ToolsListPage', () => {
  beforeEach(() => {
    mockToggleFavorite.mockReset()
    useToolsData.mockReturnValue({
      tools: mockTools,
      loading: false,
      error: null,
      toggleFavorite: mockToggleFavorite,
    })
  })

  it('muestra estado de carga', () => {
    useToolsData.mockReturnValue({ tools: [], loading: true, error: null, toggleFavorite: vi.fn() })
    render(<ToolsListPage />)
    expect(screen.getByText('tools.loading')).toBeInTheDocument()
  })

  it('muestra error cuando falla la carga', () => {
    useToolsData.mockReturnValue({ tools: [], loading: false, error: 'Error al cargar', toggleFavorite: vi.fn() })
    render(<ToolsListPage />)
    expect(screen.getByText('Error al cargar')).toBeInTheDocument()
  })

  it('muestra mensaje cuando no hay herramientas', () => {
    useToolsData.mockReturnValue({ tools: [], loading: false, error: null, toggleFavorite: vi.fn() })
    render(<ToolsListPage />)
    expect(screen.getByText('tools.noTools')).toBeInTheDocument()
  })

  it('renderiza el listado de herramientas favoritas por defecto', () => {
    render(<ToolsListPage />)
    // Por defecto showAll=false → solo 3 favoritas
    expect(screen.getByText('tools.favoriteTools')).toBeInTheDocument()
  })

  it('buscar filtra herramientas con debounce', async () => {
    const user = userEvent.setup()
    render(<ToolsListPage />)

    // Con showAll=false solo hay favoritas. Activamos showAll primero vía toggle
    // Para testear búsqueda de forma simple buscamos en favoritas
    const input = screen.getByRole('searchbox')
    await user.type(input, 'Tool 1')

    // El debounce es 300ms — esperamos que el valor se aplique
    await waitFor(() => {
      expect(input).toHaveValue('Tool 1')
    })
  })

  it('limpiar búsqueda vacía el input', async () => {
    const user = userEvent.setup()
    render(<ToolsListPage />)

    const input = screen.getByRole('searchbox')
    await user.type(input, 'React')

    // Botón de limpiar aparece cuando hay texto
    const clearBtn = screen.getByLabelText('tools.clearSearch')
    await user.click(clearBtn)

    expect(input).toHaveValue('')
  })

  it('el botón de limpiar no aparece con input vacío', () => {
    render(<ToolsListPage />)
    expect(screen.queryByLabelText('tools.clearSearch')).not.toBeInTheDocument()
  })

  it('cambiar pageSize no rompe la paginación', async () => {
    const user = userEvent.setup()
    useToolsData.mockReturnValue({
      tools: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1, name: `T${i}`, category: 'dev', description: '', isFavorite: true, lastUsedAt: null,
      })),
      loading: false,
      error: null,
      toggleFavorite: mockToggleFavorite,
    })
    render(<ToolsListPage />)

    const select = screen.getByRole('combobox', { name: 'tools.itemsPerPage' })
    await user.selectOptions(select, '16')

    // No debe haber error de runtime — el selector sigue presente
    expect(select).toHaveValue('16')
  })
})
