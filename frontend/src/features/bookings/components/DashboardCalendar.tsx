import { useMemo } from 'react'
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS, es, ca } from 'date-fns/locale'

const LOCALES = {
  'en-US': enUS,
  en: enUS,
  'es-ES': es,
  es,
  'ca-ES': ca,
  ca,
} as const

const DEFAULT_VIEWS: readonly View[] = ['month', 'week', 'day', 'agenda']

const TONE_BG: Record<NonNullable<CalendarEvent['tone']>, string> = {
  primary: '#7c3aed',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0ea5e9',
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: string
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

export interface DashboardCalendarProps {
  events: readonly CalendarEvent[]
  defaultView?: View
  view?: View
  views?: readonly View[]
  date?: Date
  onNavigate?: (date: Date) => void
  onView?: (view: View) => void
  onSelectEvent?: (event: CalendarEvent) => void
  /** BCP-47 locale tag (e.g. 'es-ES'). Falls back to en-US. */
  locale?: string
  loading?: boolean
  /** Translated labels for the toolbar. */
  messages?: {
    today?: string
    previous?: string
    next?: string
    month?: string
    week?: string
    day?: string
    agenda?: string
    noEventsInRange?: string
  }
}

/**
 * Calendar shell built on top of react-big-calendar. The host passes mapped
 * events (with optional `tone`) and decides which views to enable.
 *
 * Purely presentational: data fetching, range computation and side effects
 * are responsibilities of the caller.
 *
 * Lives in `features/bookings/components/` for now: it's only used by the
 * bookings widget. If a second consumer appears it can be extracted to
 * `@ceedcv-maya/shared-dashboard-react` per the workspace "extract at ≥2 consumers"
 * rule, behind a sub-export so siblings without react-big-calendar/date-fns
 * are not affected.
 */
export function DashboardCalendar({
  events,
  defaultView = 'month',
  view,
  views = DEFAULT_VIEWS,
  date,
  onNavigate,
  onView,
  onSelectEvent,
  locale = 'en-US',
  loading = false,
  messages,
}: DashboardCalendarProps) {
  const localizer = useMemo(() => {
    const dateFnsLocale = (LOCALES as Record<string, Locale>)[locale] ?? enUS
    return dateFnsLocalizer({
      format,
      parse,
      startOfWeek: () => startOfWeek(new Date(), { locale: dateFnsLocale }),
      getDay,
      locales: { [locale]: dateFnsLocale },
    })
  }, [locale])

  const eventPropGetter = (event: CalendarEvent) => {
    const tone = event.tone ?? 'primary'
    return {
      style: {
        backgroundColor: TONE_BG[tone],
        borderColor: TONE_BG[tone],
        color: 'white',
      },
    }
  }

  return (
    <div className="h-full flex flex-col relative" data-testid="dashboard-calendar">
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex items-center justify-center bg-ui-card/60 dark:bg-ui-dark-card/60"
        >
          <div className="h-6 w-24 bg-ui-border-l dark:bg-ui-dark-border rounded animate-pulse" />
        </div>
      )}
      <Calendar
        localizer={localizer}
        events={events as CalendarEvent[]}
        startAccessor="start"
        endAccessor="end"
        allDayAccessor="allDay"
        titleAccessor="title"
        defaultView={defaultView}
        view={view}
        views={views as View[]}
        date={date}
        onNavigate={onNavigate}
        onView={onView}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventPropGetter}
        culture={locale}
        messages={messages}
        style={{ flex: 1, minHeight: 0 }}
      />
    </div>
  )
}
