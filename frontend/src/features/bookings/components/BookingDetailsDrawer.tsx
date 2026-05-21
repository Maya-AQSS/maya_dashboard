import { Drawer } from '@maya/shared-ui-react'
import type { Booking } from '../types/booking'

interface BookingDetailsDrawerProps {
  booking: Booking | null
  onClose: () => void
  /** BCP-47 tag — usado para el formateo de fechas. */
  dateLocale: string
  /** Traductor del consumidor. Sólo se llaman claves bajo `dashboard.bookings.*`. */
  t: (key: string) => string
}

const STATUS_TONE: Record<string, string> = {
  confirmed: 'bg-success-light text-success-dark dark:bg-success-dark/30 dark:text-success',
  pending: 'bg-warning-light text-warning-dark dark:bg-warning-dark/30 dark:text-warning',
  cancelled: 'bg-danger-light text-danger-dark dark:bg-danger-dark/30 dark:text-danger',
}

function formatDateLong(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date)
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '—'
  const totalMinutes = Math.round(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  )
}

export function BookingDetailsDrawer({
  booking,
  onClose,
  dateLocale,
  t,
}: BookingDetailsDrawerProps) {
  const open = booking !== null
  if (!booking) {
    return <Drawer open={false} onClose={onClose} title="" width="sm">{null}</Drawer>
  }

  const statusKey = `dashboard.bookings.status.${booking.status}`
  const statusLabel = t(statusKey)
  const statusTone = STATUS_TONE[booking.status] ?? STATUS_TONE.confirmed

  const startEndSameDay = sameDay(booking.startAt, booking.endAt)
  const duration = formatDuration(booking.endAt.getTime() - booking.startAt.getTime())

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="truncate">{booking.title}</span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusTone}`}
          >
            {statusLabel}
          </span>
        </div>
      }
      width="sm"
    >
      <dl className="flex flex-col gap-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-secondary dark:text-text-dark-secondary mb-1">
            {t('dashboard.bookings.fields.schedule')}
          </dt>
          <dd className="text-text-primary dark:text-text-dark-primary">
            {booking.allDay ? (
              <>
                <div className="capitalize">{formatDateLong(booking.startAt, dateLocale)}</div>
                <div className="text-xs text-text-secondary dark:text-text-dark-secondary mt-0.5">
                  {t('dashboard.bookings.fields.allDay')}
                </div>
              </>
            ) : startEndSameDay ? (
              <>
                <div className="capitalize">{formatDateLong(booking.startAt, dateLocale)}</div>
                <div className="text-text-secondary dark:text-text-dark-secondary mt-0.5">
                  {formatTime(booking.startAt, dateLocale)}
                  {' — '}
                  {formatTime(booking.endAt, dateLocale)}
                </div>
              </>
            ) : (
              <>
                <div className="capitalize">
                  {formatDateLong(booking.startAt, dateLocale)}{' '}
                  <span className="text-text-secondary dark:text-text-dark-secondary">
                    · {formatTime(booking.startAt, dateLocale)}
                  </span>
                </div>
                <div className="capitalize">
                  {formatDateLong(booking.endAt, dateLocale)}{' '}
                  <span className="text-text-secondary dark:text-text-dark-secondary">
                    · {formatTime(booking.endAt, dateLocale)}
                  </span>
                </div>
              </>
            )}
          </dd>
        </div>

        {!booking.allDay && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-text-secondary dark:text-text-dark-secondary mb-1">
              {t('dashboard.bookings.fields.duration')}
            </dt>
            <dd className="text-text-primary dark:text-text-dark-primary">{duration}</dd>
          </div>
        )}

        {booking.resourceName && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-text-secondary dark:text-text-dark-secondary mb-1">
              {t('dashboard.bookings.fields.resource')}
            </dt>
            <dd className="text-text-primary dark:text-text-dark-primary">
              {booking.resourceName}
              {booking.resourceId && (
                <span className="text-xs text-text-secondary dark:text-text-dark-secondary ml-2">
                  ({booking.resourceId})
                </span>
              )}
            </dd>
          </div>
        )}

        <div>
          <dt className="text-xs uppercase tracking-wide text-text-secondary dark:text-text-dark-secondary mb-1">
            {t('dashboard.bookings.fields.id')}
          </dt>
          <dd className="text-text-primary dark:text-text-dark-primary font-mono text-xs">
            {booking.id}
          </dd>
        </div>
      </dl>
    </Drawer>
  )
}
