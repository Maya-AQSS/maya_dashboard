import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'

const apiGetJsonMock = vi.fn()
const apiFetchJsonMock = vi.fn()

vi.mock('../../../api/http', () => ({
  apiGetJson: (...args: unknown[]) => apiGetJsonMock(...args),
  apiFetchJson: (...args: unknown[]) => apiFetchJsonMock(...args),
  mapApiError: (err: unknown, prefix: string) => {
    if (err instanceof Error) return err
    return new Error(`${prefix}.errorLoad`)
  },
}))

vi.mock('@ceedcv-maya/shared-auth-react', () => ({
  useAuth: () => ({ user: { sub: 'user-1' } }),
}))

// t() devuelve la clave (o el valor interpolado de {time}) para asserts estables.
vi.mock('@ceedcv-maya/shared-i18n-react', () => ({
  useLocale: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts && 'time' in opts ? String(opts.time) : key,
    dateLocale: undefined,
  }),
}))

// El recordatorio pasivo (efecto en login) se mockea para no contaminar apiFetchJson.
const postAttendanceReminderMock = vi.fn().mockResolvedValue(undefined)
vi.mock('../api/attendanceReminderApi', () => ({
  postAttendanceReminder: () => postAttendanceReminderMock(),
}))

import { useFichajeAlerts } from './useFichajeAlerts'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return createElement(QueryClientProvider, { client }, children)
}

beforeEach(() => {
  apiGetJsonMock.mockReset()
  apiFetchJsonMock.mockReset()
  postAttendanceReminderMock.mockClear()
  sessionStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function todayYmd(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

describe('useFichajeAlerts', () => {
  it('shows the amber alert when there are no attendances today', async () => {
    apiGetJsonMock.mockResolvedValueOnce({ data: [], meta: { date: todayYmd(), count: 0 } })

    const { result } = renderHook(() => useFichajeAlerts(), { wrapper })

    await waitFor(() => expect(apiGetJsonMock).toHaveBeenCalled())
    expect(result.current.alerts).toHaveLength(1)
    expect(result.current.alerts[0].id).toBe(`local:no-fichado:${todayYmd()}`)
    expect(result.current.alerts[0].color).toBe('amber')
    expect(result.current.alerts[0].actionKind).toBe('clockIn')
    expect(result.current.alerts[0].canDismiss).toBe(false)
  })

  it('shows the green confirmation when the user already checked in today', async () => {
    const today = new Date()
    today.setHours(9, 15, 0, 0)
    apiGetJsonMock.mockResolvedValueOnce({
      data: [
        {
          id: 'a1',
          user_id: 'user-1',
          check_in: today.toISOString(),
          check_out: null,
          source: 'kiosk',
        },
      ],
      meta: { date: todayYmd(), count: 1 },
    })

    const { result } = renderHook(() => useFichajeAlerts(), { wrapper })

    await waitFor(() => expect(result.current.alerts[0].id).toBe(`local:fichado:${todayYmd()}`))
    expect(result.current.alerts[0].color).toBe('green')
    expect(result.current.alerts[0].text).toMatch(/\d{2}:\d{2}/)
    expect(result.current.alerts[0].actionLabel).toBeNull()
    expect(result.current.alerts[0].canDismiss).toBe(true)
  })

  it('clockIn() posts to the API and invalidates the daily-fichajes query', async () => {
    // First fetch: no attendances yet today.
    apiGetJsonMock.mockResolvedValueOnce({ data: [], meta: { date: todayYmd(), count: 0 } })
    apiFetchJsonMock.mockResolvedValueOnce({
      id: '99',
      user_id: 'user-1',
      check_in: new Date().toISOString(),
      check_out: null,
      source: 'manual',
    })

    const { result } = renderHook(() => useFichajeAlerts(), { wrapper })
    await waitFor(() => expect(result.current.alerts[0].id).toBe(`local:no-fichado:${todayYmd()}`))

    result.current.clockIn()

    await waitFor(() => expect(apiFetchJsonMock).toHaveBeenCalled())
    expect(apiFetchJsonMock.mock.calls[0][0]).toBe('/dashboard/user/user-1/attendances')
    expect(apiFetchJsonMock.mock.calls[0][1]).toMatchObject({ method: 'POST' })
  })

  it('shows "Fichando…" label while the POST is in flight', async () => {
    apiGetJsonMock.mockResolvedValueOnce({ data: [], meta: { date: todayYmd(), count: 0 } })
    let resolvePost: ((v: unknown) => void) | undefined
    apiFetchJsonMock.mockImplementationOnce(() => new Promise((resolve) => { resolvePost = resolve }))

    const { result } = renderHook(() => useFichajeAlerts(), { wrapper })
    await waitFor(() => expect(result.current.alerts[0].actionLabel).toBe('dashboard.fichaje.clockInButton'))

    result.current.clockIn()

    await waitFor(() => expect(result.current.alerts[0].actionLabel).toBe('dashboard.fichaje.clockingIn'))
    expect(result.current.clockInPending).toBe(true)

    resolvePost?.({ id: '1', user_id: 'user-1', check_in: new Date().toISOString(), check_out: null, source: 'manual' })
  })
})
