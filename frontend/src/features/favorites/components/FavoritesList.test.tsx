import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('@maya/shared-ui-react', () => ({
  ConfirmDialog: ({
    open,
    onConfirm,
    onCancel,
    title,
  }: {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
    title: string
  }) => {
    if (!open) return null
    return (
      <div role="dialog">
        <span>{title}</span>
        <button onClick={onConfirm}>confirm</button>
        <button onClick={onCancel}>cancel</button>
      </div>
    )
  },
  FAVORITE_STAR_FILLED_CHAR: '★',
}))

vi.mock('../context/FavoritesContext', () => ({
  useFavoritesContext: vi.fn(),
}))

import { useLocale } from '@maya/shared-i18n-react'
import { useFavoritesContext } from '../context/FavoritesContext'
import FavoritesList from './FavoritesList'

const mockUseLocale = vi.mocked(useLocale)
const mockUseFavoritesContext = vi.mocked(useFavoritesContext)

const removeMock = vi.fn()

function setupMocks({
  favorites = [] as { id: string; name?: string; description?: string | null; documentationUrl?: string | null }[],
  loading = false,
  error = null as string | null,
} = {}) {
  mockUseLocale.mockReturnValue({
    t: (key: string) => key,
    locale: 'es',
    setLocale: vi.fn(),
    localeOptions: [],
  } as any)
  mockUseFavoritesContext.mockReturnValue({
    favorites,
    loading,
    error,
    add: vi.fn(),
    remove: removeMock,
  })
}

describe('FavoritesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('estado de carga', () => {
    it('muestra mensaje de loading cuando loading es true', () => {
      setupMocks({ loading: true })
      render(<FavoritesList />)
      expect(screen.getByText('favorites.loading')).toBeTruthy()
    })

    it('no muestra cards cuando loading es true', () => {
      setupMocks({
        loading: true,
        favorites: [{ id: '1', name: 'App1' }],
      })
      render(<FavoritesList />)
      expect(screen.queryByText('App1')).toBeNull()
    })
  })

  describe('estado de error', () => {
    it('muestra el mensaje de error con role=alert cuando error no es null', () => {
      setupMocks({ error: 'favorites.errorLoad' })
      render(<FavoritesList />)
      const alertEl = screen.getByRole('alert')
      expect(alertEl.textContent).toContain('favorites.errorLoad')
    })

    it('no muestra role=alert cuando error es null', () => {
      setupMocks({ error: null })
      render(<FavoritesList />)
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  describe('lista vacía', () => {
    it('muestra mensaje de no favoritos cuando la lista está vacía', () => {
      setupMocks({ favorites: [] })
      render(<FavoritesList />)
      expect(screen.getByText('favorites.noFavorites')).toBeTruthy()
    })
  })

  describe('lista con favoritos', () => {
    it('muestra el nombre de cada favorito', () => {
      setupMocks({
        favorites: [
          { id: '1', name: 'App One' },
          { id: '2', name: 'App Two' },
        ],
      })
      render(<FavoritesList />)
      expect(screen.getByText('App One')).toBeTruthy()
      expect(screen.getByText('App Two')).toBeTruthy()
    })

    it('muestra la descripción cuando está presente', () => {
      setupMocks({
        favorites: [{ id: '1', name: 'App', description: 'Great app' }],
      })
      render(<FavoritesList />)
      expect(screen.getByText('Great app')).toBeTruthy()
    })

    it('no muestra descripción cuando es null', () => {
      setupMocks({
        favorites: [{ id: '1', name: 'App', description: null }],
      })
      render(<FavoritesList />)
      expect(screen.queryByText('null')).toBeNull()
    })

    it('muestra enlace de documentación cuando documentationUrl está presente', () => {
      setupMocks({
        favorites: [
          { id: '1', name: 'App', documentationUrl: 'https://docs.example.com' },
        ],
      })
      render(<FavoritesList />)
      const link = document.querySelector('a[href="https://docs.example.com"]')
      expect(link).not.toBeNull()
    })

    it('no muestra enlace de documentación cuando documentationUrl es null', () => {
      setupMocks({
        favorites: [{ id: '1', name: 'App', documentationUrl: null }],
      })
      render(<FavoritesList />)
      expect(document.querySelector('a[href^="https"]')).toBeNull()
    })
  })

  describe('eliminar favorito', () => {
    it('muestra ConfirmDialog al hacer clic en el botón de estrella', () => {
      setupMocks({
        favorites: [{ id: '1', name: 'App' }],
      })
      render(<FavoritesList />)

      const starButton = screen.getByRole('button', {
        name: 'favorites.removeFromFavorites',
      })
      fireEvent.click(starButton)

      expect(screen.getByRole('dialog')).toBeTruthy()
    })

    it('llama a remove con el id al confirmar el diálogo', () => {
      setupMocks({
        favorites: [{ id: '5', name: 'App Five' }],
      })
      render(<FavoritesList />)

      fireEvent.click(screen.getByRole('button', { name: 'favorites.removeFromFavorites' }))
      fireEvent.click(screen.getByText('confirm'))

      expect(removeMock).toHaveBeenCalledWith('5')
    })

    it('cierra el diálogo al cancelar sin llamar a remove', () => {
      setupMocks({
        favorites: [{ id: '5', name: 'App Five' }],
      })
      render(<FavoritesList />)

      fireEvent.click(screen.getByRole('button', { name: 'favorites.removeFromFavorites' }))
      fireEvent.click(screen.getByText('cancel'))

      expect(removeMock).not.toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
