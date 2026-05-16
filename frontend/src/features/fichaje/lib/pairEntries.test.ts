import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { pairEntries, type FichajeEntry } from './pairEntries'

function dt(yyyy: number, mm: number, dd: number, hh: number, mins: number): Date {
  return new Date(yyyy, mm - 1, dd, hh, mins, 0, 0)
}

describe('pairEntries', () => {
  it('returns empty array for empty input', () => {
    expect(pairEntries([], dt(2026, 1, 1, 12, 0))).toEqual([])
  })

  it('pairs a simple in/out sequence', () => {
    const entries: FichajeEntry[] = [
      { type: 'in', timestamp: dt(2026, 1, 1, 8, 0) },
      { type: 'out', timestamp: dt(2026, 1, 1, 14, 0) },
    ]
    const pairs = pairEntries(entries, dt(2026, 1, 1, 12, 0))
    expect(pairs).toHaveLength(1)
    expect(pairs[0]).toMatchObject({
      autoClose: false,
      entrada: { type: 'in' },
      salida: { type: 'out' },
    })
  })

  it('sorts unsorted input before pairing', () => {
    const entries: FichajeEntry[] = [
      { type: 'out', timestamp: dt(2026, 1, 1, 14, 0) },
      { type: 'in', timestamp: dt(2026, 1, 1, 8, 0) },
    ]
    const pairs = pairEntries(entries, dt(2026, 1, 1, 12, 0))
    expect(pairs).toHaveLength(1)
    expect(new Date(pairs[0].entrada.timestamp).getHours()).toBe(8)
    expect(new Date(pairs[0].salida!.timestamp).getHours()).toBe(14)
  })

  it('pairs multiple in/out cycles in a single day', () => {
    const entries: FichajeEntry[] = [
      { type: 'in', timestamp: dt(2026, 1, 1, 8, 0) },
      { type: 'out', timestamp: dt(2026, 1, 1, 13, 0) },
      { type: 'in', timestamp: dt(2026, 1, 1, 14, 0) },
      { type: 'out', timestamp: dt(2026, 1, 1, 18, 0) },
    ]
    const pairs = pairEntries(entries, dt(2026, 1, 1, 12, 0))
    expect(pairs).toHaveLength(2)
    expect(pairs.every((p) => p.salida !== null)).toBe(true)
    expect(pairs.every((p) => p.autoClose === false)).toBe(true)
  })

  it('ignores orphan out entries without a preceding in', () => {
    const entries: FichajeEntry[] = [
      { type: 'out', timestamp: dt(2026, 1, 1, 14, 0) },
      { type: 'in', timestamp: dt(2026, 1, 1, 15, 0) },
      { type: 'out', timestamp: dt(2026, 1, 1, 18, 0) },
    ]
    const pairs = pairEntries(entries, dt(2026, 1, 1, 12, 0))
    expect(pairs).toHaveLength(1)
    expect(new Date(pairs[0].entrada.timestamp).getHours()).toBe(15)
  })

  describe('open in entry at end', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(dt(2026, 1, 15, 10, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('synthesizes a 20:00 auto-close when the selectedDate is not today', () => {
      const entries: FichajeEntry[] = [
        { type: 'in', timestamp: dt(2026, 1, 10, 8, 0) },
      ]
      const pairs = pairEntries(entries, dt(2026, 1, 10, 12, 0))
      expect(pairs).toHaveLength(1)
      expect(pairs[0].autoClose).toBe(true)
      expect(pairs[0].salida).not.toBeNull()
      const close = pairs[0].salida!.timestamp as Date
      expect(close.getHours()).toBe(20)
      expect(close.getMinutes()).toBe(0)
      expect(close.getDate()).toBe(10)
    })

    it('leaves the pair open when the selectedDate is today', () => {
      const entries: FichajeEntry[] = [
        { type: 'in', timestamp: dt(2026, 1, 15, 8, 0) },
      ]
      const pairs = pairEntries(entries, dt(2026, 1, 15, 12, 0))
      expect(pairs).toHaveLength(1)
      expect(pairs[0].autoClose).toBe(false)
      expect(pairs[0].salida).toBeNull()
    })
  })
})
