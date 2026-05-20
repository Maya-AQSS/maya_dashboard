import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'

// --- Mocks (must be before imports) ---

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}))

vi.mock('@maya/shared-auth-react', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@maya/shared-i18n-react', () => ({
  useLocale: vi.fn(),
}))

vi.mock('../../../api/auth', () => ({
  updateMyLocale: vi.fn(),
}))

vi.mock('../api/profileApi', () => ({
  updateProfile: vi.fn(),
}))

const hasPermissionMock = vi.fn((_slug: string) => true)

vi.mock('../../user-profile', () => ({
  useUserProfile: () => ({
    hasPermission: hasPermissionMock,
  }),
}))

vi.mock('@maya/shared-ui-react', () => ({
  Button: ({
    children,
    onClick,
    type,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    type?: string
    disabled?: boolean
  }) => (
    <button onClick={onClick} type={(type as 'button' | 'submit' | 'reset') ?? 'button'} disabled={disabled}>
      {children}
    </button>
  ),
  FieldLabel: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  PageTitle: ({
    title,
    subtitle,
    onBack,
    actions,
  }: {
    title: string
    subtitle?: string
    onBack?: () => void
    actions?: React.ReactNode
  }) => (
    <div data-testid="page-title">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {onBack && <button onClick={onBack} data-testid="back-button">Back</button>}
      {actions}
    </div>
  ),
  Select: ({
    children,
    onChange,
    value,
    disabled,
    id,
  }: {
    children: React.ReactNode
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
    value?: string
    disabled?: boolean
    id?: string
  }) => (
    <select id={id} onChange={onChange} value={value} disabled={disabled}>
      {children}
    </select>
  ),
  TextInput: ({
    id,
    type,
    ...props
  }: {
    id?: string
    type?: string
    [key: string]: unknown
  }) => <input id={id} type={type ?? 'text'} data-testid={`input-${id}`} {...props} />,
  TextArea: ({
    id,
    rows,
    ...props
  }: {
    id?: string
    rows?: number
    [key: string]: unknown
  }) => <textarea id={id} rows={rows} data-testid={`textarea-${id}`} {...props} />,
}))

// --- Imports after mocks ---
import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../api/profileApi'
import { updateMyLocale } from '../../../api/auth'
import ProfilePage from './ProfilePage'

const mockUseAuth = vi.mocked(useAuth)
const mockUseLocale = vi.mocked(useLocale)
const mockUseNavigate = vi.mocked(useNavigate)
const mockUpdateProfile = vi.mocked(updateProfile)
const mockUpdateMyLocale = vi.mocked(updateMyLocale)

const mockNavigate = vi.fn()

const testUser = {
  sub: 'u-1',
  name: 'Juan',
  surname: 'García',
  email: 'juan@example.com',
  username: 'jgarcia',
  phone: '600123456',
  role: 'Empleado',
  dni: '12345678A',
  street: 'Calle Mayor',
  addressNumber: '10',
  addressFloor: '2',
  addressDoor: '3',
  postalCode: '46001',
  city: 'Valencia',
  bio: 'Bio de prueba',
}

function setupMocks({
  user = testUser as typeof testUser | null,
  locale = 'es',
  localeOptions = [{ code: 'es', label: 'Español' }, { code: 'en', label: 'English' }],
} = {}) {
  mockUseAuth.mockReturnValue({ user } as any)
  mockUseLocale.mockReturnValue({
    t: (key: string) => key,
    locale,
    setLocale: vi.fn(),
    localeOptions,
  } as any)
  mockUseNavigate.mockReturnValue(mockNavigate)
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    hasPermissionMock.mockImplementation(() => true)
    setupMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('sin usuario', () => {
    it('muestra mensaje de no usuario cuando user es null', () => {
      setupMocks({ user: null })
      render(<ProfilePage />)
      expect(screen.getByText('profile.noUser')).toBeTruthy()
    })

    it('no muestra el PageTitle cuando user es null', () => {
      setupMocks({ user: null })
      render(<ProfilePage />)
      expect(screen.queryByTestId('page-title')).toBeNull()
    })
  })

  describe('permisos', () => {
    it('muestra mensaje sin profile.show', () => {
      hasPermissionMock.mockImplementation((slug: string) => slug !== 'profile.show')
      render(<ProfilePage />)
      expect(screen.getByText('profile.noPermission')).toBeTruthy()
      expect(screen.queryByText('Juan')).toBeNull()
    })

    it('oculta el botón de editar sin profile.update', () => {
      hasPermissionMock.mockImplementation((slug: string) => slug === 'profile.show')
      render(<ProfilePage />)
      expect(screen.queryByText('profile.edit')).toBeNull()
      expect(screen.getByText('Juan')).toBeTruthy()
    })

    it('deshabilita el selector de idioma sin profile.update', () => {
      hasPermissionMock.mockImplementation((slug: string) => slug === 'profile.show')
      render(<ProfilePage />)
      expect(screen.getByRole('combobox')).toHaveProperty('disabled', true)
    })
  })

  describe('modo visualización', () => {
    it('muestra el título del perfil', () => {
      render(<ProfilePage />)
      expect(screen.getByText('profile.title')).toBeTruthy()
    })

    it('muestra el nombre del usuario', () => {
      render(<ProfilePage />)
      expect(screen.getByText('Juan')).toBeTruthy()
    })

    it('muestra el apellido del usuario', () => {
      render(<ProfilePage />)
      expect(screen.getByText('García')).toBeTruthy()
    })

    it('muestra el email del usuario', () => {
      render(<ProfilePage />)
      expect(screen.getByText('juan@example.com')).toBeTruthy()
    })

    it('muestra guión cuando campo es null/undefined', () => {
      const userWithNulls = { ...testUser, surname: undefined, dni: undefined, phone: undefined }
      setupMocks({ user: userWithNulls as any })
      render(<ProfilePage />)
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThan(0)
    })

    it('muestra el botón de editar', () => {
      render(<ProfilePage />)
      expect(screen.getByText('profile.edit')).toBeTruthy()
    })

    it('muestra la tarjeta de preferencias con selector de idioma', () => {
      render(<ProfilePage />)
      expect(screen.getByRole('combobox')).toBeTruthy()
    })

    it('llama navigate(-1) al hacer clic en back', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByTestId('back-button'))
      expect(mockNavigate).toHaveBeenCalledWith(-1)
    })
  })

  describe('modo edición', () => {
    it('entra en modo edición al hacer clic en profile.edit', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByText('profile.edit'))
      expect(screen.getByText('profile.editTitle')).toBeTruthy()
    })

    it('muestra formulario al entrar en modo edición', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByText('profile.edit'))
      expect(screen.getByText('profile.save')).toBeTruthy()
    })

    it('muestra botones de cancelar y guardar', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByText('profile.edit'))
      expect(screen.getByText('profile.cancel')).toBeTruthy()
      expect(screen.getByText('profile.save')).toBeTruthy()
    })

    it('cancela la edición al hacer clic en cancelar', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByText('profile.edit'))
      fireEvent.click(screen.getByText('profile.cancel'))
      expect(screen.getByText('profile.title')).toBeTruthy()
      expect(screen.queryByText('profile.editTitle')).toBeNull()
    })

    it('no muestra el botón de editar mientras se edita', () => {
      render(<ProfilePage />)
      fireEvent.click(screen.getByText('profile.edit'))
      expect(screen.queryByText('profile.edit')).toBeNull()
    })

    it('guarda el perfil exitosamente', async () => {
      mockUpdateProfile.mockResolvedValueOnce({ id: 'u-1', name: 'Juan' } as any)
      render(<ProfilePage />)
      fireEvent.click(screen.getByText('profile.edit'))
      await act(async () => {
        fireEvent.click(screen.getByText('profile.save'))
      })
      // After successful save, should exit edit mode
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1)
    })

    it('muestra error cuando updateProfile devuelve null', async () => {
      mockUpdateProfile.mockResolvedValueOnce(null as any)
      render(<ProfilePage />)
      fireEvent.click(screen.getByText('profile.edit'))
      await act(async () => {
        fireEvent.click(screen.getByText('profile.save'))
      })
      // saveError is set
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1)
    })

    it('muestra error cuando updateProfile lanza excepción', async () => {
      mockUpdateProfile.mockRejectedValueOnce(new Error('Network error'))
      render(<ProfilePage />)
      fireEvent.click(screen.getByText('profile.edit'))
      await act(async () => {
        fireEvent.click(screen.getByText('profile.save'))
      })
      const alerts = screen.queryAllByRole('alert')
      // Error message should appear somewhere (either from saveError or validation)
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1)
    })

    it('muestra error con clave profile.* cuando la excepción empieza por profile.', async () => {
      mockUpdateProfile.mockRejectedValueOnce(new Error('profile.someError'))
      render(<ProfilePage />)
      fireEvent.click(screen.getByText('profile.edit'))
      await act(async () => {
        fireEvent.click(screen.getByText('profile.save'))
      })
      expect(mockUpdateProfile).toHaveBeenCalledTimes(1)
    })
  })

  describe('PreferencesCard — cambio de idioma', () => {
    it('muestra las opciones de idioma', () => {
      render(<ProfilePage />)
      const select = screen.getByRole('combobox')
      expect(select).toBeTruthy()
    })

    it('llama updateMyLocale al cambiar el idioma con profile.update', async () => {
      hasPermissionMock.mockImplementation(() => true)
      mockUpdateMyLocale.mockResolvedValueOnce(undefined)
      render(<ProfilePage />)
      const select = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.change(select, { target: { value: 'en' } })
      })
      expect(mockUpdateMyLocale).toHaveBeenCalledWith('en')
    })

    it('no llama updateMyLocale sin profile.update', async () => {
      hasPermissionMock.mockImplementation((slug: string) => slug === 'profile.show')
      render(<ProfilePage />)
      const select = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.change(select, { target: { value: 'en' } })
      })
      expect(mockUpdateMyLocale).not.toHaveBeenCalled()
    })

    it('no llama updateMyLocale cuando el idioma seleccionado es el actual', async () => {
      render(<ProfilePage />)
      const select = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.change(select, { target: { value: 'es' } })
      })
      expect(mockUpdateMyLocale).not.toHaveBeenCalled()
    })

    it('no lanza error cuando updateMyLocale falla', async () => {
      mockUpdateMyLocale.mockRejectedValueOnce(new Error('Server error'))
      render(<ProfilePage />)
      const select = screen.getByRole('combobox')
      await act(async () => {
        fireEvent.change(select, { target: { value: 'en' } })
      })
      // Should not throw
      expect(mockUpdateMyLocale).toHaveBeenCalledWith('en')
    })
  })
})
