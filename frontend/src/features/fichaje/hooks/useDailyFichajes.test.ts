import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'

const apiGetJsonMock = vi.fn()

vi.mock('../../../api/http', () => ({
  apiGetJson: (...args: unknown[]) => apiGetJsonMock(...args),
  mapApiError: (err: unknown, prefix: string) => {
    if (err instanceof Error) return err
    return new Error(`${prefix}.errorLoad`)
  },
}))

import useDailyFichajes from './useDailyFichajes'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return createElement(QueryClientProvider, { client }, children)
}

beforeEach(() => {
  apiGetJsonMock.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useDailyFichajes', () => {
  it('no fetches when userId is undefined', async () => {
    const { result } = renderHook(() => useDailyFichajes(undefined, new Date('2026-05-21')), {
      wrapper,
    })
    expect(result.current.entries).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(apiGetJsonMock).not.toHaveBeenCalled()
  })

  it('queries the attendances endpoint with the right date param', async () => {
    apiGetJsonMock.mockResolvedValueOnce({ data: [], meta: { date: '2026-05-21', count: 0 } })

    renderHook(() => useDailyFichajes('user-1', new Date(2026, 4, 21)), { wrapper })

    await waitFor(() => expect(apiGetJsonMock).toHaveBeenCalled())
    expect(apiGetJsonMock.mock.calls[0][0]).toBe('/dashboard/user/user-1/attendances?date=2026-05-21')
  })

  it('expands an attendance row into in + out entries', async () => {
    apiGetJsonMock.mockResolvedValueOnce({
      data: [
        {
          id: 'a1',
          user_id: 'user-1',
          check_in: '2026-05-21T08:30:00Z',
          check_out: '2026-05-21T13:00:00Z',
          source: 'kiosk',
        },
      ],
      meta: { date: '2026-05-21', count: 1 },
    })

    const { result } = renderHook(
      () => useDailyFichajes('user-1', new Date(2026, 4, 21)),
      { wrapper },
    )

    await waitFor(() => expect(result.current.entries.length).toBe(2))
    expect(result.current.entries[0].type).toBe('in')
    expect(result.current.entries[1].type).toBe('out')
    expect(result.current.entries[0].timestamp).toBeInstanceOf(Date)
  })

  it('keeps an open attendance as a single in entry', async () => {
    apiGetJsonMock.mockResolvedValueOnce({
      data: [
        {
          id: 'a1',
          user_id: 'user-1',
          check_in: '2026-05-21T08:30:00Z',
          check_out: null,
          source: 'manual',
        },
      ],
      meta: { date: '2026-05-21', count: 1 },
    })

    const { result } = renderHook(
      () => useDailyFichajes('user-1', new Date(2026, 4, 21)),
      { wrapper },
    )

    await waitFor(() => expect(result.current.entries.length).toBe(1))
    expect(result.current.entries[0].type).toBe('in')
  })

  it('returns the i18n key as error message when fetch fails', async () => {
    apiGetJsonMock.mockRejectedValueOnce(new Error('dashboard.fichaje.errorServer'))

    const { result } = renderHook(
      () => useDailyFichajes('user-1', new Date(2026, 4, 21)),
      { wrapper },
    )

    await waitFor(() => expect(result.current.error).toBe('dashboard.fichaje.errorServer'))
    expect(result.current.entries).toEqual([])
  })
})
