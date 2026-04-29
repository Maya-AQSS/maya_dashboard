import { Fragment, useState } from'react'
import { useAuth } from'@maya/shared-auth-react'
import { Button } from'@maya/shared-ui-react'
import { useLocale } from'../../../shared/i18n'
import useDailyFichajes from'../../fichaje/hooks/useDailyFichajes'

function toDateString(date) {
 const y = date.getFullYear()
 const m = String(date.getMonth() + 1).padStart(2,'0')
 const d = String(date.getDate()).padStart(2,'0')
 return`${y}-${m}-${d}`
}

function isToday(date) {
 return toDateString(date) === toDateString(new Date())
}

function formatTime(timestamp) {
 if (!(timestamp instanceof Date)) return'—'
 return timestamp.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
}

function toTimeValue(timestamp) {
 if (!(timestamp instanceof Date)) return''
 const h = String(timestamp.getHours()).padStart(2,'0')
 const m = String(timestamp.getMinutes()).padStart(2,'0')
 return`${h}:${m}`
}

function formatHours(ms) {
 if (ms == null) return'—'
 const totalMinutes = Math.round(ms / 60000)
 const h = Math.floor(totalMinutes / 60)
 const m = totalMinutes % 60
 return`${h}h ${m.toString().padStart(2,'0')}m`
}

function pairEntries(entries, selectedDate) {
 const sorted = [...entries].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
 const pairs = []
 let currentIn = null

 for (const entry of sorted) {
 if (entry.type ==='in') {
 currentIn = entry
 } else if (entry.type ==='out' && currentIn) {
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
 salida: { ...currentIn, type:'out', timestamp: autoCloseTime },
 autoClose: true,
 })
 } else {
 pairs.push({ entrada: currentIn, salida: null, autoClose: false })
 }
 }

 return pairs
}

function startOfDay(date) {
 const d = new Date(date)
 d.setHours(0, 0, 0, 0)
 return d
}

function startOfWeek(date) {
 // Semana empieza en domingo (igual que la imagen de referencia).
 const d = startOfDay(date)
 d.setDate(d.getDate() - d.getDay())
 return d
}

function addDays(date, n) {
 const d = new Date(date)
 d.setDate(d.getDate() + n)
 return d
}

function capitalize(s) {
 return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function WeekDatePicker({ selectedDate, onSelect, dateLocale, t }) {
 const today = startOfDay(new Date())
 const weekStart = startOfWeek(selectedDate)
 const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

 const monthYearFmt = new Intl.DateTimeFormat(dateLocale, { month:'long', year:'numeric' })
 const weekdayFmt = new Intl.DateTimeFormat(dateLocale, { weekday:'short' })

 const goPrevWeek = () => onSelect(addDays(selectedDate, -7))
 const nextDate = addDays(selectedDate, 7)
 const canGoNext = nextDate <= today
 const goNextWeek = () => { if (canGoNext) onSelect(nextDate) }

 return (<div className="px-1 pt-1 pb-1">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-sm font-display font-semibold text-on-surface capitalize">
 {monthYearFmt.format(selectedDate)}
 </h3>
 <div className="flex items-center gap-0.5">
 <button
 type="button"
 onClick={goPrevWeek}
 aria-label={t('dashboard.fichaje.prevDay')}
 className="w-6 h-6 inline-flex items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/5 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
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
 className="w-6 h-6 inline-flex items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/5 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
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
 return (<button
 key={d.toISOString()}
 type="button"
 onClick={() => { if (!future) onSelect(d) }}
 disabled={future}
 aria-pressed={selected}
 className={[
'flex flex-col items-center justify-center py-1 rounded-xl transition-all',
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
 selected
 ?'bg-surface-container-low shadow-[0_3px_10px_-3px_rgba(0,0,0,0.18)] ring-1 ring-outline-variant'
 : future
 ?'opacity-30 cursor-not-allowed'
 :'hover:bg-surface-container-low/60',
 ].join('')}
 >
 <span className="text-[9px] uppercase tracking-wide text-on-surface-variant capitalize leading-tight">
 {weekdayFmt.format(d).replace('.','')}
 </span>
 <span className="text-[12px] font-semibold text-on-surface leading-tight">
 {d.getDate()}
 </span>
 <span
 className={[
'mt-0.5 w-[3px] h-[3px] rounded-full transition-opacity',
 selected ?'bg-on-surface opacity-100' :'opacity-0',
 ].join('')}
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

 const [editingRow, setEditingRow] = useState(null)
 const [requestForm, setRequestForm] = useState({ date:'', from:'', to:'' })
 const [pendingRequests, setPendingRequests] = useState({})

 const handleDatePicked = (date) => {
 const picked = new Date(date)
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
 to: pair.salida ? toTimeValue(pair.salida.timestamp) :'20:00',
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

 return (<div className="h-full flex flex-col gap-2">
 <WeekDatePicker
 selectedDate={selectedDate}
 onSelect={handleDatePicked}
 dateLocale={dateLocale}
 t={t}
 />

 <div className="flex-1 overflow-auto">
 {loading && (<div className="flex items-center justify-center h-full">
 <div className="h-6 w-24 bg-outline-variant rounded animate-pulse" />
 </div>
 )}
 {error && !loading && (<p role="alert" aria-live="assertive" className="text-danger dark:text-danger text-sm text-center py-4">
 {error}
 </p>
 )}
 {!loading && !error && pairs.length === 0 && (<p className="text-on-surface-variant text-sm text-center py-4">
 {t('dashboard.fichaje.noEntries')}
 </p>
 )}
 {!loading && !error && pairs.length > 0 && (<table className="w-full text-sm">
 <thead>
 <tr className="border-b border-outline">
 <th className="text-center px-2 py-1 text-success font-medium">
 {t('dashboard.fichaje.entrada')}
 </th>
 <th className="text-center px-2 py-1 text-info font-medium">
 {t('dashboard.fichaje.salida')}
 </th>
 <th className="text-center px-2 py-1 text-on-surface-variant font-medium">
 {t('dashboard.fichaje.columnHoras')}
 </th>
 <th className="w-8" />
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100">
 {pairs.map((pair, i) => {
 const ms = pair.salida
 ? new Date(pair.salida.timestamp) - new Date(pair.entrada.timestamp)
 : null
 const pending = pendingRequests[i]
 const isEditing = editingRow === i

 return (<Fragment key={`pair-${i}`}>
 <tr className={pending ?'bg-warning-light/50 dark:bg-warning-dark/10' :''}>
 <td className="px-2 py-1.5 text-center text-success-dark font-medium">
 {isEditing ? (<input
 type="time"
 value={requestForm.from}
 onChange={(e) => setRequestForm((f) => ({ ...f, from: e.target.value }))}
 className="w-full border border-outline bg-surface-container-low text-on-surface rounded px-1.5 py-0.5 outline-none focus:border-primary text-xs"
 />
 ) : (formatTime(pair.entrada.timestamp)
 )}
 </td>
 <td className="px-2 py-1.5 text-center font-medium">
 {isEditing ? (<input
 type="time"
 value={requestForm.to}
 onChange={(e) => setRequestForm((f) => ({ ...f, to: e.target.value }))}
 className="w-full border border-outline bg-surface-container-low text-on-surface rounded px-1.5 py-0.5 outline-none focus:border-primary text-xs"
 />
 ) : !pair.salida ? (<span className="text-warning-dark text-xs">
 {t('dashboard.fichaje.inProgress')}
 </span>
 ) : pair.autoClose ? (<span className="text-on-surface-muted text-xs italic">
 {formatTime(pair.salida.timestamp)}
 <br />
 <span className="text-danger dark:text-danger not-italic">
 {t('dashboard.fichaje.salidaNoFichada')}
 </span>
 </span>
 ) : (<span className="text-info-dark">
 {formatTime(pair.salida.timestamp)}
 </span>
 )}
 </td>
 <td className="px-2 py-1.5 text-center text-on-surface">
 {!isEditing && formatHours(ms)}
 </td>
 <td className="px-1 py-1.5 text-center">
 {isEditing ? (<div className="flex flex-col gap-1">
 <Button variant="primary" size="xs" onClick={() => handleSubmitRequest(i)}>
 {t('dashboard.fichaje.submitModification')}
 </Button>
 <Button variant="secondary" size="xs" onClick={() => setEditingRow(null)}>
 {t('dashboard.cancel')}
 </Button>
 </div>
 ) : pending ? (<span className="text-xs text-warning-dark font-medium">⏳</span>
 ) : (<Button
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

 {pending && !isEditing && (<tr className="bg-warning-light/50 dark:bg-warning-dark/10">
 <td colSpan={4} className="px-3 pb-2">
 <div className="flex items-center justify-center gap-2 text-xs">
 <span className="px-1.5 py-0.5 rounded-full bg-warning-light dark:bg-warning-dark/40 text-warning-dark font-medium">
 {t('dashboard.fichaje.pendingApproval')}
 </span>
 <span className="text-on-surface-variant">
 {t('dashboard.fichaje.requestModification')}:
 {''}{pending.from} → {pending.to}
 </span>
 </div>
 </td>
 </tr>
 )}
 </Fragment>
 )
 })}
 </tbody>
 {pairs.filter((p) => p.salida).length > 0 && (<tfoot>
 <tr className="border-t-2 border-outline">
 <td colSpan={2} className="px-2 py-1.5 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
 {t('dashboard.fichaje.total')}
 </td>
 <td className="px-2 py-1.5 text-center font-semibold text-on-surface">
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
