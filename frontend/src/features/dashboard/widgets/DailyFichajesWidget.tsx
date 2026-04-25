import { Fragment, useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { useLocale } from '../../../shared/i18n'
import useDailyFichajes from '../../fichaje/hooks/useDailyFichajes'

function toDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isToday(date) {
  return toDateString(date) === toDateString(new Date())
}

function formatTime(timestamp) {
  if (!(timestamp instanceof Date)) return '—'
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function toTimeValue(timestamp) {
  if (!(timestamp instanceof Date)) return ''
  const h = String(timestamp.getHours()).padStart(2, '0')
  const m = String(timestamp.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function formatHours(ms) {
  if (ms == null) return '—'
  const totalMinutes = Math.round(ms / 60000)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

function pairEntries(entries, selectedDate) {
  const sorted = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  const pairs = []
  let currentIn = null

  for (const entry of sorted) {
    if (entry.type === 'in') {
      currentIn = entry
    } else if (entry.type === 'out' && currentIn) {
      pairs.push({ entrada: currentIn, salida: entry, autoClose: false })
      currentIn = null
    }
  }

  if (currentIn) {
    if (!isToday(selectedDate)) {
      // Use the entrada's own date so the 20:00 cutoff lands on the correct day
      const autoCloseTime = new Date(currentIn.timestamp)
      autoCloseTime.setHours(20, 0, 0, 0)
      pairs.push({
        entrada: currentIn,
        salida: { ...currentIn, type: 'out', timestamp: autoCloseTime },
        autoClose: true,
      })
    } else {
      pairs.push({ entrada: currentIn, salida: null, autoClose: false })
    }
  }

  return pairs
}

function DailyFichajesWidget() {
  const { user } = useAuth()
  const { t } = useLocale()

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  const { entries, loading, error } = useDailyFichajes(user?.sub, selectedDate)

  const [editingRow, setEditingRow] = useState(null)
  const [requestForm, setRequestForm] = useState({ date: '', from: '', to: '' })
  const [pendingRequests, setPendingRequests] = useState({})

  const goToPrevDay = () => {
    setSelectedDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() - 1)
      return next
    })
    setEditingRow(null)
    setPendingRequests({})
  }

  const goToNextDay = () => {
    if (isToday(selectedDate)) return
    setSelectedDate((d) => {
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      return next
    })
    setEditingRow(null)
    setPendingRequests({})
  }

  const handleDatePick = (e) => {
    const [year, month, day] = e.target.value.split('-').map(Number)
    const picked = new Date(year, month - 1, day)
    picked.setHours(0, 0, 0, 0)
    setSelectedDate(picked)
    setEditingRow(null)
    setPendingRequests({})
  }

  const handleOpenEdit = (index, pair) => {
    setEditingRow(index)
    setRequestForm({
      date: toDateString(selectedDate),
      from: toTimeValue(pair.entrada.timestamp),
      to: pair.salida ? toTimeValue(pair.salida.timestamp) : '20:00',
    })
  }

  const handleSubmitRequest = (index) => {
    setPendingRequests((prev) => ({ ...prev, [index]: { ...requestForm } }))
    setEditingRow(null)
  }

  const pairs = pairEntries(entries, selectedDate)
  const totalMs = pairs.reduce((sum, p) => {
    if (!p.salida) return sum
    return sum + (new Date(p.salida.timestamp) - new Date(p.entrada.timestamp))
  }, 0)

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center gap-2 justify-center">
        <button
          type="button"
          onClick={goToPrevDay}
          aria-label={t('dashboard.fichaje.prevDay')}
          className="p-1 rounded hover:bg-ui-body dark:hover:bg-ui-dark-border transition text-text-secondary dark:text-text-dark-secondary"
        >
          ←
        </button>
        <input
          type="date"
          value={toDateString(selectedDate)}
          max={toDateString(new Date())}
          onChange={handleDatePick}
          className="text-sm border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card text-text-primary dark:text-text-dark-primary rounded px-2 py-1 outline-none focus:border-warning-dark"
        />
        <button
          type="button"
          onClick={goToNextDay}
          disabled={isToday(selectedDate)}
          aria-label={t('dashboard.fichaje.nextDay')}
          className="p-1 rounded hover:bg-ui-body dark:hover:bg-ui-dark-border transition text-text-secondary dark:text-text-dark-secondary disabled:opacity-40 disabled:cursor-default"
        >
          →
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="h-6 w-24 bg-ui-border-l dark:bg-ui-dark-border rounded animate-pulse" />
          </div>
        )}
        {error && !loading && (
          <p className="text-danger dark:text-danger text-sm text-center py-4">{error}</p>
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
                  ? new Date(pair.salida.timestamp) - new Date(pair.entrada.timestamp)
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
                            <button
                              type="button"
                              onClick={() => handleSubmitRequest(i)}
                              className="py-0.5 px-1.5 rounded-full bg-odoo-purple hover:bg-odoo-purple-d text-text-inverse font-medium transition text-xs whitespace-nowrap"
                            >
                              {t('dashboard.fichaje.submitModification')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRow(null)}
                              className="py-0.5 px-1.5 rounded-full border border-ui-border dark:border-ui-dark-border text-text-secondary dark:text-text-dark-secondary hover:bg-ui-body dark:hover:bg-ui-dark-card transition text-xs"
                            >
                              {t('dashboard.cancel')}
                            </button>
                          </div>
                        ) : pending ? (
                          <span className="text-xs text-warning-dark dark:text-warning font-medium">⏳</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(i, pair)}
                            title={t('dashboard.fichaje.requestModification')}
                            className="text-text-muted hover:text-violet-600 dark:hover:text-violet-400 transition text-xs p-0.5 rounded"
                          >
                            ✏️
                          </button>
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
