import { useMemo, useState } from 'react'
import type { View } from 'react-big-calendar'
import { DashboardCalendar, type CalendarEvent } from '@maya/shared-dashboard-react/calendar'
import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '@maya/shared-i18n-react'
import { useBookings } from '../../bookings/hooks/useBookings'

const TONE_BY_STATUS: Record<string, CalendarEvent['tone']> = {
  confirmed: 'primary',
  pending: 'warning',
  cancelled: 'danger',
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
}

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfWeek(date: Date): Date {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function rangeForView(view: View, date: Date): [Date, Date] {
  switch (view) {
    case 'month':
      return [startOfMonth(date), endOfMonth(date)]
    case 'week':
      return [startOfWeek(date), endOfWeek(date)]
    case 'day':
      return [startOfDay(date), endOfDay(date)]
    case 'agenda':
    default: {
      // Agenda muestra ~30 días siguientes desde la fecha actual.
      const end = new Date(date)
      end.setDate(end.getDate() + 30)
      return [startOfDay(date), endOfDay(end)]
    }
  }
}

function BookingsWidget() {
  const { user } = useAuth()
  const { t, dateLocale } = useLocale()
  const [view, setView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())

  const [from, to] = useMemo(() => rangeForView(view, currentDate), [view, currentDate])

  const { bookings, loading, error } = useBookings(
    user?.sub,
    from,
    to,
    view === 'agenda' ? 'agenda' : (view as 'month' | 'week' | 'day'),
  )

  const events = useMemo<CalendarEvent[]>(
    () =>
      bookings.map((b) => ({
        id: b.id,
        title: b.resourceName ? `${b.title} · ${b.resourceName}` : b.title,
        start: b.startAt,
        end: b.endAt,
        allDay: b.allDay,
        resource: b.resourceName ?? undefined,
        tone: TONE_BY_STATUS[b.status] ?? 'primary',
      })),
    [bookings],
  )

  const messages = {
    today: t('dashboard.calendar.today'),
    previous: t('dashboard.calendar.previous'),
    next: t('dashboard.calendar.next'),
    month: t('dashboard.calendar.month'),
    week: t('dashboard.calendar.week'),
    day: t('dashboard.calendar.day'),
    agenda: t('dashboard.calendar.agenda'),
    noEventsInRange: t('dashboard.calendar.noEventsInRange'),
  }

  return (
    <div className="h-full flex flex-col relative">
      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="text-danger dark:text-danger text-sm text-center py-2"
        >
          {t(error)}
        </p>
      )}
      <DashboardCalendar
        events={events}
        view={view}
        date={currentDate}
        onView={setView}
        onNavigate={setCurrentDate}
        loading={loading}
        locale={dateLocale}
        messages={messages}
      />
    </div>
  )
}

export default BookingsWidget
