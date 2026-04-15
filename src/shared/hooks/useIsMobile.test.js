import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile, MOBILE_BREAKPOINT } from './useIsMobile'

function createMediaQueryMock(matches) {
  const listeners = []
  return {
    matches,
    media: MOBILE_BREAKPOINT,
    addEventListener: vi.fn((_, handler) => listeners.push(handler)),
    removeEventListener: vi.fn((_, handler) => {
      const idx = listeners.indexOf(handler)
      if (idx !== -1) listeners.splice(idx, 1)
    }),
    _trigger: (newMatches) => listeners.forEach((fn) => fn({ matches: newMatches })),
  }
}

describe('useIsMobile', () => {
  let mediaQueryMock

  beforeEach(() => {
    mediaQueryMock = createMediaQueryMock(false)
    window.matchMedia = vi.fn().mockReturnValue(mediaQueryMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('devuelve false en viewport desktop (matches=false)', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('devuelve true en viewport mobile (matches=true)', () => {
    mediaQueryMock = createMediaQueryMock(true)
    window.matchMedia = vi.fn().mockReturnValue(mediaQueryMock)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('actualiza cuando el media query cambia a mobile', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => mediaQueryMock._trigger(true))
    expect(result.current).toBe(true)
  })

  it('actualiza cuando el media query vuelve a desktop', () => {
    mediaQueryMock = createMediaQueryMock(true)
    window.matchMedia = vi.fn().mockReturnValue(mediaQueryMock)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    act(() => mediaQueryMock._trigger(false))
    expect(result.current).toBe(false)
  })

  it('elimina el listener al desmontar', () => {
    const { unmount } = renderHook(() => useIsMobile())
    unmount()
    expect(mediaQueryMock.removeEventListener).toHaveBeenCalledOnce()
  })

  it('usa el breakpoint correcto', () => {
    renderHook(() => useIsMobile())
    expect(window.matchMedia).toHaveBeenCalledWith(MOBILE_BREAKPOINT)
  })
})
