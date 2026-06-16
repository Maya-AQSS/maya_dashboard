import { useEffect } from 'react'
import type { Booking } from '../types/booking'

interface BookingDetailsPopoverProps {
  booking: Booking | null
  onClose: () => void
  /** BCP-47 tag — usado para el formateo de fechas. */
  dateLocale: string
  /** Traductor del consumidor. */
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

/**
 * Popover compacto contenido dentro del widget del calendario. NO ocupa todo
 * el viewport: el contenedor padre (`BookingsWidget`) tiene `position: relative`
 * y este componente se posiciona en `absolute inset-0` por encima del calendar,
 * con un backdrop semitransparente local y un card centrado.
 *
 * Cerrar:
 *  - click en el backdrop
 *  - botón ×
 *  - tecla Escape
 */
export function BookingDetailsPopover({
  booking,
  onClose,
  dateLocale,
  t,
}: BookingDetailsPopoverProps) {
  useEffect(() => {
    if (booking === null) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [booking, onClose])

  if (booking === null) return null

  const statusLabel = t(`dashboard.bookings.status.${booking.status}`)
  const statusTone = STATUS_TONE[booking.status] ?? STATUS_TONE.confirmed

  const startEndSameDay = sameDay(booking.startAt, booking.endAt)
  const duration = formatDuration(booking.endAt.getTime() - booking.startAt.getTime())

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={booking.title}
      className="absolute inset-0 z-30 flex items-center justify-center p-3"
    >
      {/* Backdrop local al widget */}
      <button
        type="button"
        aria-label={t('actions.cancel')}
        onClick={onClose}
        className="absolute inset-0 bg-text-primary/30 dark:bg-black/50 backdrop-blur-[1px] cursor-default"
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm max-h-full overflow-auto bg-ui-card dark:bg-ui-dark-card rounded-xl border border-ui-border dark:border-ui-dark-border shadow-lg"
      >
        <div className="flex items-start gap-2 px-4 py-3 border-b border-ui-border-l dark:border-ui-dark-border">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary truncate">
              {booking.title}
            </h3>
            <span
              className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusTone}`}
            >
              {statusLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('actions.cancel')}
            className="shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-md text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary hover:bg-text-primary/5 dark:hover:bg-text-inverse/10 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <dl className="px-4 py-3 flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-2xs uppercase tracking-wide text-text-secondary dark:text-text-dark-secondary mb-0.5">
              {t('dashboard.bookings.fields.schedule')}
            </dt>
            <dd className="text-text-primary dark:text-text-dark-primary">
              {booking.allDay ? (
                <>
                  <div className="capitalize">{formatDateLong(booking.startAt, dateLocale)}</div>
                  <div className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    {t('dashboard.bookings.fields.allDay')}
                  </div>
                </>
              ) : startEndSameDay ? (
                <>
                  <div className="capitalize">{formatDateLong(booking.startAt, dateLocale)}</div>
                  <div className="text-text-secondary dark:text-text-dark-secondary">
                    {formatTime(booking.startAt, dateLocale)} — {formatTime(booking.endAt, dateLocale)}
                  </div>
                </>
              ) : (
                <>
                  <div className="capitalize">
                    {formatDateLong(booking.startAt, dateLocale)}
                    <span className="text-text-secondary dark:text-text-dark-secondary">
                      {' · '}{formatTime(booking.startAt, dateLocale)}
                    </span>
                  </div>
                  <div className="capitalize">
                    {formatDateLong(booking.endAt, dateLocale)}
                    <span className="text-text-secondary dark:text-text-dark-secondary">
                      {' · '}{formatTime(booking.endAt, dateLocale)}
                    </span>
                  </div>
                </>
              )}
            </dd>
          </div>

          {!booking.allDay && (
            <div>
              <dt className="text-2xs uppercase tracking-wide text-text-secondary dark:text-text-dark-secondary mb-0.5">
                {t('dashboard.bookings.fields.duration')}
              </dt>
              <dd className="text-text-primary dark:text-text-dark-primary">{duration}</dd>
            </div>
          )}

          {booking.resourceName && (
            <div>
              <dt className="text-2xs uppercase tracking-wide text-text-secondary dark:text-text-dark-secondary mb-0.5">
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
        </dl>
      </div>
    </div>
  )
}
