import type { WidgetRegistry } from '@ceedcv-maya/shared-dashboard-react'
import { DASHBOARD_PERMISSIONS } from '../../../permissions'

/**
 * Permiso que necesita cada widget para mostrarse; los que no aparecen aquí los ve cualquiera.
 * D27: las reservas (widget y calendario) solo con `dashboard.bookings`, que nadie tiene hasta que
 * maya_booking esté terminado.
 */
export const WIDGET_PERMISSIONS: Readonly<Record<string, string>> = {
  'bookings-calendar': DASHBOARD_PERMISSIONS.bookings,
}

export function isWidgetAllowed(
  widgetId: string,
  hasPermission: (permission: string) => boolean,
): boolean {
  const permission = WIDGET_PERMISSIONS[widgetId]
  return permission === undefined || hasPermission(permission)
}

/** El registro sin los widgets que el usuario no puede ver. */
export function allowedWidgets(
  registry: WidgetRegistry,
  hasPermission: (permission: string) => boolean,
): WidgetRegistry {
  return Object.fromEntries(
    Object.entries(registry).filter(([widgetId]) => isWidgetAllowed(widgetId, hasPermission)),
  )
}
