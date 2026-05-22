import BookingsWidget from './BookingsWidget'
import DailyFichajesWidget from './DailyFichajesWidget'
import UserAlertsWidget from './UserAlertsWidget'

export const WIDGET_REGISTRY = {
  'user-alerts': {
    id: 'user-alerts',
    titleKey: 'dashboard.widgets.userAlerts',
    hideTitle: true,
    allowOverflow: true,
    bleed: true,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    component: UserAlertsWidget,
  },
  'fichaje-daily': {
    id: 'fichaje-daily',
    titleKey: 'dashboard.widgets.fichajeDaily',
    hideTitle: true,
    defaultSize: { w: 8, h: 3 },
    minSize: { w: 4, h: 2 },
    component: DailyFichajesWidget,
  },
  'bookings-calendar': {
    id: 'bookings-calendar',
    titleKey: 'dashboard.widgets.bookings',
    hideTitle: true,
    bleed: true,
    defaultSize: { w: 12, h: 6 },
    minSize: { w: 6, h: 4 },
    component: BookingsWidget,
  },
}
