import { Fragment, useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { Button } from '@maya/shared-ui-react'
import { useLocale } from '@maya/shared-i18n-react'
import useDailyFichajes from '../../fichaje/hooks/useDailyFichajes'
import {
  pairEntries,
  type FichajeEntry,
  type FichajePair,
} from '../../fichaje/lib/pairEntries'

function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTime(timestamp: unknown): string {
  if (!(timestamp instanceof Date)) return '—'
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function toTimeValue(timestamp: unknown): string {
  if (!(timestamp instanceof Date)) return ''
  const h = String(timestamp.getHours()).padStart(2, '0')
  const m = String(timestamp.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function formatHours(ms: number | null | undefined): string {
  if (ms == null) return '—'
  const totalMinutes = Math.round(ms / 60000)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfWeek(date: Date): Date {
  // Semana empieza en domingo (igual que la imagen de referencia).
  const d = startOfDay(date)
  d.setDate(d.getDate() - d.getDay())
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

interface WeekDatePickerProps {
  selectedDate: Date
  onSelect: (date: Date) => void
  dateLocale: string
  t: (key: string) => string
}

function WeekDatePicker({ selectedDate, onSelect, dateLocale, t }: WeekDatePickerProps) {
  const today = startOfDay(new Date())
  const weekStart = startOfWeek(selectedDate)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const monthYearFmt = new Intl.DateTimeFormat(dateLocale, { month: 'long', year: 'numeric' })
  const weekdayFmt = new Intl.DateTimeFormat(dateLocale, { weekday: 'short' })

  const goPrevWeek = () => onSelect(addDays(selectedDate, -7))
  const nextDate = addDays(selectedDate, 7)
  const canGoNext = nextDate <= today
  const goNextWeek = () => { if (canGoNext) onSelect(nextDate) }

  return (
    <div className="px-1 pt-1 pb-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-display font-semibold text-text-primary dark:text-text-dark-primary capitalize">
          {monthYearFmt.format(selectedDate)}
        </h3>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={goPrevWeek}
            aria-label={t('dashboard.fichaje.prevDay')}
            className="w-6 h-6 inline-flex items-center justify-center rounded-full text-text-secondary dark:text-text-dark-secondary hover:bg-text-primary/5 dark:hover:bg-text-inverse/8 hover:text-odoo-purple dark:hover:text-odoo-dark-purple transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odoo-purple/35"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNextWeek}
            disabled={!canGoNext}
            aria-label={t('dashboard.fichaje.nextDay')}
            className="w-6 h-6 inline-flex items-center justify-center rounded-full text-text-secondary dark:text-text-dark-secondary hover:bg-text-primary/5 dark:hover:bg-text-inverse/8 hover:text-odoo-purple dark:hover:text-odoo-dark-purple disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-secondary disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odoo-purple/35"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d) => {
          const selected = startOfDay(d).getTime() === startOfDay(selectedDate).getTime()
          const future = d > today
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => { if (!future) onSelect(d) }}
              disabled={future}
              aria-pressed={selected}
              className={[
                'flex flex-col items-center justify-center py-1 rounded-xl transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odoo-purple/35',
                selected
                  ? 'bg-ui-card dark:bg-ui-dark-card shadow-[0_3px_10px_-3px_rgba(0,0,0,0.18)] ring-1 ring-ui-border-l dark:ring-ui-dark-border'
                  : future
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:bg-ui-card/60 dark:hover:bg-ui-dark-card/40',
              ].join(' ')}
            >
              <span className="text-xs uppercase tracking-wide text-text-secondary dark:text-text-dark-secondary capitalize leading-tight">
                {weekdayFmt.format(d).replace('.', '')}
              </span>
              <span className="text-xs font-semibold text-text-primary dark:text-text-dark-primary leading-tight">
                {d.getDate()}
              </span>
              <span
                className={[
                  'mt-0.5 w-[3px] h-[3px] rounded-full transition-opacity',
                  selected ? 'bg-text-primary dark:bg-text-dark-primary opacity-100' : 'opacity-0',
                ].join(' ')}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DailyFichajesWidget() {
  const { user } = useAuth()
  const { t, dateLocale } = useLocale()

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const { entries, loading, error } = useDailyFichajes(user?.sub, selectedDate)

  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [requestForm, setRequestForm] = useState({ date: '', from: '', to: '' })
  const [pendingRequests, setPendingRequests] = useState<Record<number, typeof requestForm>>({})

  const handleDatePicked = (date: Date): void => {
    const picked = new Date(date)
    picked.setHours(0, 0, 0, 0)
    setSelectedDate(picked)
    setEditingRow(null)
    setPendingRequests({})
  }

  const handleOpenEdit = (index: number, pair: FichajePair): void => {
    setEditingRow(index)
    setRequestForm({
      date: toDateString(selectedDate),
      from: toTimeValue(pair.entrada.timestamp),
      to: pair.salida ? toTimeValue(pair.salida.timestamp) : '20:00',
    })
  }

  const handleSubmitRequest = (index: number): void => {
    setPendingRequests((prev) => ({ ...prev, [index]: { ...requestForm } }))
    setEditingRow(null)
  }

  const pairs = pairEntries((entries as FichajeEntry[]) ?? [], selectedDate)
  const totalMs = pairs.reduce((sum, p) => {
    if (!p.salida) return sum
    return sum + (new Date(p.salida.timestamp).getTime() - new Date(p.entrada.timestamp).getTime())
  }, 0)

  return (
    <div className="h-full flex flex-col gap-2">
      <WeekDatePicker
        selectedDate={selectedDate}
        onSelect={handleDatePicked}
        dateLocale={dateLocale}
        t={t}
      />

      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-24 bg-ui-border-l dark:bg-ui-dark-border rounded animate-pulse" />
          </div>
        )}
        {error && !loading && (
          <p role="alert" aria-live="assertive" className="text-danger dark:text-danger text-sm text-center py-4">
            {error}
          </p>
        )}
        {!loading && !error && pairs.length === 0 && (
          <p className="text-text-secondary dark:text-text-dark-secondary text-sm text-center py-4">
            {t('dashboard.fichaje.noEntries')}
          </p>
        )}
        {!loading && !error && pairs.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ui-border dark:border-ui-dark-border">
                <th className="text-center px-2 py-1 text-success dark:text-success font-medium">
                  {t('dashboard.fichaje.entrada')}
                </th>
                <th className="text-center px-2 py-1 text-info dark:text-info font-medium">
                  {t('dashboard.fichaje.salida')}
                </th>
                <th className="text-center px-2 py-1 text-text-secondary dark:text-text-dark-secondary font-medium">
                  {t('dashboard.fichaje.columnHoras')}
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-ui-dark-border">
              {pairs.map((pair, i) => {
                const ms = pair.salida
                  ? new Date(pair.salida.timestamp).getTime() - new Date(pair.entrada.timestamp).getTime()
                  : null
                const pending = pendingRequests[i]
                const isEditing = editingRow === i

                return (
                  <Fragment key={`pair-${i}`}>
                    <tr className={pending ? 'bg-warning-light/50 dark:bg-warning-dark/10' : ''}>
                      <td className="px-2 py-1.5 text-center text-success-dark dark:text-success font-medium">
                        {isEditing ? (
                          <input
                            type="time"
                            value={requestForm.from}
                            onChange={(e) => setRequestForm((f) => ({ ...f, from: e.target.value }))}
                            className="w-full border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card text-text-primary dark:text-text-dark-primary rounded px-1.5 py-0.5 outline-none focus:border-odoo-purple text-xs"
                          />
                        ) : (
                          formatTime(pair.entrada.timestamp)
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-center font-medium">
                        {isEditing ? (
                          <input
                            type="time"
                            value={requestForm.to}
                            onChange={(e) => setRequestForm((f) => ({ ...f, to: e.target.value }))}
                            className="w-full border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card text-text-primary dark:text-text-dark-primary rounded px-1.5 py-0.5 outline-none focus:border-odoo-purple text-xs"
                          />
                        ) : !pair.salida ? (
                          <span className="text-warning-dark dark:text-warning text-xs">
                            {t('dashboard.fichaje.inProgress')}
                          </span>
                        ) : pair.autoClose ? (
                          <span className="text-text-muted dark:text-text-secondary text-xs italic">
                            {formatTime(pair.salida.timestamp)}
                            <br />
                            <span className="text-danger dark:text-danger not-italic">
                              {t('dashboard.fichaje.salidaNoFichada')}
                            </span>
                          </span>
                        ) : (
                          <span className="text-info-dark dark:text-info">
                            {formatTime(pair.salida.timestamp)}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 text-center text-text-primary dark:text-text-dark-secondary">
                        {!isEditing && formatHours(ms)}
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        {isEditing ? (
                          <div className="flex flex-col gap-1">
                            <Button variant="primary" size="xs" onClick={() => handleSubmitRequest(i)}>
                              {t('dashboard.fichaje.submitModification')}
                            </Button>
                            <Button variant="secondary" size="xs" onClick={() => setEditingRow(null)}>
                              {t('dashboard.cancel')}
                            </Button>
                          </div>
                        ) : pending ? (
                          <span className="text-xs text-warning-dark dark:text-warning font-medium">⏳</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleOpenEdit(i, pair)}
                            title={t('dashboard.fichaje.requestModification')}
                          >
                            ✏️
                          </Button>
                        )}
                      </td>
                    </tr>

                    {pending && !isEditing && (
                      <tr className="bg-warning-light/50 dark:bg-warning-dark/10">
                        <td colSpan={4} className="px-3 pb-2">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className="px-1.5 py-0.5 rounded-full bg-warning-light dark:bg-warning-dark/40 text-warning-dark dark:text-warning font-medium">
                              {t('dashboard.fichaje.pendingApproval')}
                            </span>
                            <span className="text-text-secondary dark:text-text-dark-secondary">
                              {t('dashboard.fichaje.requestModification')}:
                              {' '}{pending.from} → {pending.to}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
            {pairs.filter((p) => p.salida).length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-ui-border dark:border-ui-dark-border">
                  <td colSpan={2} className="px-2 py-1.5 text-right text-xs font-semibold text-text-secondary dark:text-text-dark-secondary uppercase tracking-wide">
                    {t('dashboard.fichaje.total')}
                  </td>
                  <td className="px-2 py-1.5 text-center font-semibold text-text-primary dark:text-text-dark-primary">
                    {formatHours(totalMs)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  )
}

export default DailyFichajesWidget
