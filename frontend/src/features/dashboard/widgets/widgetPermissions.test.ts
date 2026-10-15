import { describe, it, expect } from 'vitest'
import type { WidgetRegistry } from '@ceedcv-maya/shared-dashboard-react'
import { allowedWidgets, isWidgetAllowed } from './widgetPermissions'

const widget = (id: string) => ({
  id,
  titleKey: `dashboard.widgets.${id}`,
  defaultSize: { w: 4, h: 3 },
  minSize: { w: 2, h: 2 },
  component: () => null,
})

const registry = {
  'user-alerts': widget('user-alerts'),
  'fichaje-daily': widget('fichaje-daily'),
  'bookings-calendar': widget('bookings-calendar'),
} as unknown as WidgetRegistry

describe('widgetPermissions (D27)', () => {
  it('oculta las reservas sin dashboard.bookings', () => {
    const allowed = allowedWidgets(registry, () => false)

    expect(Object.keys(allowed)).toEqual(['user-alerts', 'fichaje-daily'])
    expect(isWidgetAllowed('bookings-calendar', () => false)).toBe(false)
  })

  it('muestra las reservas con dashboard.bookings', () => {
    const allowed = allowedWidgets(registry, (permission) => permission === 'dashboard.bookings')

    expect(Object.keys(allowed)).toEqual(['user-alerts', 'fichaje-daily', 'bookings-calendar'])
  })

  it('los widgets sin permiso propio se ven siempre', () => {
    expect(isWidgetAllowed('fichaje-daily', () => false)).toBe(true)
  })
})
