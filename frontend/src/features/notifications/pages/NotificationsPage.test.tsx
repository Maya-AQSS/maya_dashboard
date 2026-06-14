import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@ceedcv-maya/shared-i18n-react', () => ({
  useLocale: () => ({ t: (k: string) => k, locale: 'es', setLocale: vi.fn() }),
  useNotificationText: () => (input: { key?: string; fallback?: string }) =>
    input.fallback ?? input.key ?? '',
}))

vi.mock('@ceedcv-maya/shared-ui-react', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  DataTable: ({ rows, emptyMessage, loading }: { rows: unknown[]; emptyMessage?: React.ReactNode; loading?: boolean }) => (
    <div>
      {loading ? <span>loading</span> : null}
      {rows.length === 0 && !loading ? <span>{emptyMessage}</span> : null}
      {rows.map((r: unknown, i: number) => <div key={i} data-testid="notif-row">{JSON.stringify(r)}</div>)}
    </div>
  ),
  FilterField: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PageTitle: ({ title }: { title: string }) => <h1>{title}</h1>,
  Pagination: () => null,
  Select: ({ children }: { children: React.ReactNode }) => <select>{children}</select>,
  TextInput: ({ onChange }: { onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <input onChange={onChange} />
  ),
  useTablePreferences: () => ({
    hiddenIds: new Set<string>(),
    toggleHidden: vi.fn(),
    sortBy: null,
    setSortBy: vi.fn(),
    pageSize: 25,
    setPageSize: vi.fn(),
  }),
  useToast: () => ({ toast: vi.fn() }),
}))

vi.mock('../../user-profile', () => ({
  useUserProfile: () => ({
    hasPermission: () => true,
  }),
}))

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}))

vi.mock('../api/notificationsApi', () => ({
  getUnreadCount: vi.fn(),
}))

import { useNotifications } from '../hooks/useNotifications'
import { getUnreadCount } from '../api/notificationsApi'
import NotificationsPage from './NotificationsPage'

const mockUseNotifications = vi.mocked(useNotifications)
const mockGetUnreadCount = vi.mocked(getUnreadCount)

const NOOP_ASYNC = vi.fn().mockResolvedValue(undefined)

const DEFAULT_RETURN = {
  notifications: [],
  meta: null,
  loading: false,
  error: null,
  onMarkRead: NOOP_ASYNC,
  onMarkAllRead: NOOP_ASYNC,
  refresh: vi.fn(),
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, createElement(NotificationsPage)),
    ),
  )
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    mockUseNotifications.mockReturnValue(DEFAULT_RETURN)
    mockGetUnreadCount.mockResolvedValue({ unread: 0 })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('renderizado', () => {
    it('muestra el PageTitle', () => {
      renderPage()
      expect(screen.getByRole('heading', { level: 1 })).toBeTruthy()
    })
  })

  describe('estado de carga', () => {
    it('pasa loading=true al DataTable cuando está cargando', () => {
      mockUseNotifications.mockReturnValue({ ...DEFAULT_RETURN, loading: true })
      renderPage()
      expect(screen.getByText('loading')).toBeTruthy()
    })
  })

  describe('estado de error', () => {
    it('muestra el mensaje de error cuando error no es null', () => {
      mockUseNotifications.mockReturnValue({ ...DEFAULT_RETURN, error: 'notifications.errorServer' })
      renderPage()
      const alertEl = screen.getByRole('alert')
      expect(alertEl.textContent).toContain('notifications.errorServer')
    })

    it('no muestra error cuando error es null', () => {
      renderPage()
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  describe('lista vacía', () => {
    it('muestra el emptyMessage cuando no hay notificaciones', () => {
      renderPage()
      expect(screen.getByText('notifications.empty')).toBeTruthy()
    })

    it('muestra filas cuando hay notificaciones', () => {
      const notif = {
        id: 1,
        title: 'Aviso',
        app: 'maya_auth',
        type: 'user.invited',
        recipient_id: 'uuid-1',
        body: 'Texto',
        channels: ['app'],
        metadata: {},
        read_at: null,
        created_at: '2026-05-27T10:00:00Z',
        message_id: null,
      }
      mockUseNotifications.mockReturnValue({ ...DEFAULT_RETURN, notifications: [notif as never] })
      renderPage()
      expect(screen.queryByText('notifications.empty')).toBeNull()
      expect(screen.getAllByTestId('notif-row')).toHaveLength(1)
    })
  })

  describe('botón marcar todas como leídas', () => {
    it('aparece cuando hay notificaciones no leídas', async () => {
      mockGetUnreadCount.mockResolvedValue({ unread: 1 })
      renderPage()
      await waitFor(() => expect(screen.getByText('notifications.markAllRead')).toBeTruthy())
    })

    it('no aparece cuando todas están leídas', async () => {
      mockGetUnreadCount.mockResolvedValue({ unread: 0 })
      renderPage()
      await waitFor(() => expect(screen.queryByText('notifications.markAllRead')).toBeNull())
    })
  })
})
