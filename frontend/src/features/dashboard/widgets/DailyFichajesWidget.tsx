import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { Button } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useUserProfile, profileDisplayInitials } from '../../user-profile'
import useDailyFichajes from '../../fichaje/hooks/useDailyFichajes'
import { postClockIn, postClockOut } from '../../fichaje/api/clockInApi'
import {
  pairEntries,
  type FichajeEntry,
  type FichajePair,
} from '../../fichaje/lib/pairEntries'

/** Convierte un Date a `YYYY-MM-DD` (sin zona horaria, hora local). */
function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function parseDateInputValue(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split('-').map((n) => Number.parseInt(n, 10))
  const date = new Date(y, m - 1, d)
  date.setHours(0, 0, 0, 0)
  return Number.isNaN(date.getTime()) ? null : date
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

/**
 * Hash determinista nombre→hue (0..360). Misma persona → mismo color.
 * Garantiza buena distribución aunque dos nombres compartan prefijo.
 */
function hueFromString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 360
}

interface ProfileAvatarProps {
  name: string
  initials: string
  /** URL opcional de foto. Si falla la carga se cae a iniciales automáticamente. */
  src?: string | null
  size?: number
}

/**
 * Avatar circular con foto o iniciales. Cuando `src` no está disponible o
 * la imagen falla, se pinta un círculo con fondo HSL determinístico (basado
 * en `name`) e iniciales en blanco.
 */
function ProfileAvatar({ name, initials, src, size = 36 }: ProfileAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const hue = useMemo(() => hueFromString(name || initials || 'U'), [name, initials])
  const showImage = Boolean(src) && !imgFailed

  // Vars CSS — encapsulan los únicos valores realmente dinámicos (tamaño y hue).
  // Los gradientes y demás reglas viven en `.maya-profile-avatar` (CSS file).
  const cssVars = {
    '--avatar-size': `${size}px`,
    '--avatar-hue': hue,
  } as React.CSSProperties

  if (showImage) {
    return (
      <img
        src={src ?? undefined}
        alt={name}
        width={size}
        height={size}
        onError={() => setImgFailed(true)}
        className="maya-profile-avatar-img rounded-full object-cover ring-2 ring-ui-card dark:ring-ui-dark-card shadow-card-sm shrink-0"
        style={cssVars}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={name}
      className="maya-profile-avatar inline-flex items-center justify-center rounded-full font-display font-semibold text-text-inverse shrink-0 ring-2 ring-ui-card dark:ring-ui-dark-card shadow-card-sm"
      style={cssVars}
    >
      {initials}
    </span>
  )
}

interface EventCellProps {
  type: 'in' | 'out' | 'auto'
  timestamp: Date | string
  isEditing: boolean
  pending: boolean
  editValue: string
  onEditChange: (value: string) => void
  onOpenEdit: () => void
  label: string
  requestModificationLabel: string
}

/**
 * Celda de un evento del par: lápiz (editar) + hora (input al editar) +
 * etiqueta de color. El pencil va antes de la hora; el dot identificador
 * (entrada=verde, salida=azul, auto-cierre=ámbar) se incrusta en el label.
 */
function EventCell({
  type,
  timestamp,
  isEditing,
  pending,
  editValue,
  onEditChange,
  onOpenEdit,
  label,
  requestModificationLabel,
}: EventCellProps) {
  const dotClass =
    type === 'in'
      ? 'bg-success'
      : type === 'auto'
        ? 'bg-warning'
        : 'bg-info'
  const labelClass =
    type === 'in'
      ? 'text-success dark:text-success'
      : type === 'auto'
        ? 'text-warning-dark dark:text-warning'
        : 'text-info dark:text-info'

  return (
    <div className="flex-1 min-w-0 inline-flex items-center gap-1.5">
      {!isEditing && !pending && (
        <button
          type="button"
          onClick={onOpenEdit}
          aria-label={requestModificationLabel}
          title={requestModificationLabel}
          className="shrink-0 w-6 h-6 inline-flex items-center justify-center rounded-md text-text-muted dark:text-text-dark-muted hover:bg-ui-body dark:hover:bg-ui-dark-bg hover:text-odoo-purple dark:hover:text-odoo-dark-purple transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odoo-purple/35"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      )}

      {isEditing ? (
        <input
          type="time"
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          className="w-[88px] border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card text-text-primary dark:text-text-dark-primary rounded px-1.5 py-0.5 text-xs font-mono outline-none focus:border-odoo-purple"
        />
      ) : (
        <span className="text-sm font-mono font-semibold text-text-primary dark:text-text-dark-primary tabular-nums">
          {formatTime(timestamp instanceof Date ? timestamp : new Date(timestamp))}
        </span>
      )}

      <span className={`inline-flex items-center gap-1 text-2xs uppercase tracking-wider font-medium ${labelClass}`}>
        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
        {label}
      </span>
    </div>
  )
}

interface DayProgressBarProps {
  pairs: FichajePair[]
  /** Hora local del comienzo del rango visible (por defecto 08:00). */
  startHour?: number
  /** Hora local del fin del rango visible (por defecto 20:00). */
  endHour?: number
  /** Marca opcional de "ahora" para destacarla en el día actual. */
  showNowMarker?: boolean
}

/**
 * Barra horizontal de la jornada: una franja por par entrada→salida sobre el
 * intervalo [startHour, endHour). Los pares cerrados pintan en verde (trabajo
 * efectivo); el par abierto pinta hasta `now()` con un patrón discontinuo
 * para indicar que sigue activo. Una marca vertical translúcida señala la
 * hora actual.
 */
function DayProgressBar({
  pairs,
  startHour = 8,
  endHour = 20,
  showNowMarker = true,
}: DayProgressBarProps) {
  const dayStartMs = useMemo(() => {
    const ref = pairs[0]?.entrada.timestamp
    const base = ref instanceof Date ? new Date(ref) : new Date()
    base.setHours(startHour, 0, 0, 0)
    return base.getTime()
  }, [pairs, startHour])

  const totalMs = (endHour - startHour) * 60 * 60 * 1000
  const clamp = (ms: number) => Math.max(0, Math.min(totalMs, ms - dayStartMs))

  const nowOffsetPct = useMemo(() => {
    const now = new Date()
    const offset = clamp(now.getTime())
    return (offset / totalMs) * 100
  }, [clamp, totalMs])

  const segments = pairs.map((pair) => {
    const entradaMs = (pair.entrada.timestamp instanceof Date
      ? pair.entrada.timestamp
      : new Date(pair.entrada.timestamp)).getTime()
    const salidaMs = pair.salida
      ? (pair.salida.timestamp instanceof Date
          ? pair.salida.timestamp
          : new Date(pair.salida.timestamp)).getTime()
      : Date.now()
    const fromPct = (clamp(entradaMs) / totalMs) * 100
    const toPct = (clamp(salidaMs) / totalMs) * 100
    return {
      fromPct,
      widthPct: Math.max(0.6, toPct - fromPct),
      open: !pair.salida,
      autoClose: pair.autoClose,
    }
  })

  const ticks = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  return (
    <div className="w-full">
      <div className="relative h-4 rounded-full bg-ui-body dark:bg-ui-dark-bg overflow-hidden ring-1 ring-ui-border-l dark:ring-ui-dark-border">
        {segments.map((seg, i) => {
          const variant = seg.open
            ? 'maya-day-segment--open'
            : seg.autoClose
              ? 'maya-day-segment--auto'
              : 'maya-day-segment--closed'
          const segVars = {
            '--seg-left': `${seg.fromPct}%`,
            '--seg-width': `${seg.widthPct}%`,
          } as React.CSSProperties
          return (
            <span
              key={`seg-${i}`}
              className={`maya-day-segment ${variant}`}
              style={segVars}
            />
          )
        })}
        {showNowMarker && nowOffsetPct > 0 && nowOffsetPct < 100 && (
          <span
            aria-hidden="true"
            className="maya-day-now-marker"
            style={{ '--now-left': `${nowOffsetPct}%` } as React.CSSProperties}
          />
        )}
      </div>
      <div className="flex justify-between mt-1">
        {ticks.filter((_, i) => i % 2 === 0).map((h) => (
          <span key={h} className="text-[10px] text-text-muted dark:text-text-dark-muted tabular-nums">
            {String(h).padStart(2, '0')}:00
          </span>
        ))}
      </div>
    </div>
  )
}

interface DateChipProps {
  selectedDate: Date
  onChange: (date: Date) => void
  dateLocale: string
}

/**
 * Chip clicable arriba-derecha que muestra la fecha actual del widget. Al
 * pulsarlo dispara `showPicker()` sobre un `<input type="date">` superpuesto
 * (invisible) para que el navegador renderice su propio datepicker nativo.
 * En navegadores sin `showPicker` el input captura el click directamente.
 */
function DateChip({ selectedDate, onChange, dateLocale }: DateChipProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const todayYmd = toDateString(startOfDay(new Date()))
  const isToday = toDateString(selectedDate) === todayYmd

  const fmt = new Intl.DateTimeFormat(dateLocale, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })

  const handleOpen = () => {
    const el = inputRef.current
    if (!el) return
    // Chromium / Safari modernos: muestra el picker sin focus.
    type ShowPickerInput = HTMLInputElement & { showPicker?: () => void }
    const withPicker = el as ShowPickerInput
    if (typeof withPicker.showPicker === 'function') {
      withPicker.showPicker()
    } else {
      el.focus()
      el.click()
    }
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ui-body dark:bg-ui-dark-bg border border-ui-border-l dark:border-ui-dark-border text-text-secondary dark:text-text-dark-secondary hover:bg-ui-card dark:hover:bg-ui-dark-card hover:border-odoo-purple/35 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-odoo-purple/35"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-xs font-medium capitalize">
          {isToday ? 'Hoy' : fmt.format(selectedDate).replace('.', '')}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <input
        ref={inputRef}
        type="date"
        value={toDateString(selectedDate)}
        max={todayYmd}
        onChange={(e) => {
          const next = parseDateInputValue(e.target.value)
          if (next) onChange(next)
        }}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}

function DailyFichajesWidget() {
  const { user } = useAuth()
  const userId = user?.sub
  const { t, dateLocale } = useLocale()
  const { profile } = useUserProfile()
  const queryClient = useQueryClient()

  const displayName = profile?.name?.trim() || user?.name?.trim() || user?.email || ''
  const displayInitials = profileDisplayInitials(profile)
  const displaySubtitle = profile?.email || user?.email || ''

  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))
  const selectedYmd = useMemo(() => toDateString(selectedDate), [selectedDate])
  const isSelectedToday = selectedYmd === toDateString(startOfDay(new Date()))

  const { entries, loading, error } = useDailyFichajes(userId, selectedDate)
  const pairs = pairEntries((entries as FichajeEntry[]) ?? [], selectedDate)
  const hasOpenPair = pairs.length > 0 && pairs[pairs.length - 1].salida === null

  // Tick cada 60s para que el par abierto refresque el total sin recargar.
  const [nowTick, setNowTick] = useState<number>(() => Date.now())
  useEffect(() => {
    if (!hasOpenPair) return
    const id = window.setInterval(() => setNowTick(Date.now()), 60_000)
    return () => window.clearInterval(id)
  }, [hasOpenPair])

  const totalMs = pairs.reduce<number>((sum, p) => {
    const start = (p.entrada.timestamp instanceof Date
      ? p.entrada.timestamp
      : new Date(p.entrada.timestamp)).getTime()
    const end = p.salida
      ? (p.salida.timestamp instanceof Date
          ? p.salida.timestamp
          : new Date(p.salida.timestamp)).getTime()
      : nowTick
    return sum + Math.max(0, end - start)
  }, 0)

  // ── Mutaciones clock-in / clock-out ─────────────────────────────────────
  const invalidateToday = (): void => {
    void queryClient.invalidateQueries({
      queryKey: ['daily-fichajes', userId, selectedYmd],
    })
  }

  const clockInMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('dashboard.fichaje.errorLoad')
      return postClockIn(userId)
    },
    onSuccess: invalidateToday,
  })

  const clockOutMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('dashboard.fichaje.errorLoad')
      return postClockOut(userId)
    },
    onSuccess: invalidateToday,
  })

  const clockPending = clockInMutation.isPending || clockOutMutation.isPending
  const handleClockToggle = (): void => {
    if (!userId || clockPending) return
    if (hasOpenPair) clockOutMutation.mutate()
    else clockInMutation.mutate()
  }

  // ── Edición / solicitud de modificación ─────────────────────────────────
  const [editingPair, setEditingPair] = useState<number | null>(null)
  const [requestForm, setRequestForm] = useState({ date: '', from: '', to: '' })
  const [pendingRequests, setPendingRequests] = useState<Record<number, { date: string; from: string; to: string }>>({})

  const resetEditingState = (): void => {
    setEditingPair(null)
    setPendingRequests({})
  }

  const handleDatePicked = (date: Date): void => {
    setSelectedDate(startOfDay(date))
    resetEditingState()
  }

  const handleOpenEdit = (pairIndex: number): void => {
    const pair = pairs[pairIndex]
    setEditingPair(pairIndex)
    setRequestForm({
      date: selectedYmd,
      from: toTimeValue(pair.entrada.timestamp),
      to: pair.salida ? toTimeValue(pair.salida.timestamp) : '20:00',
    })
  }

  const handleSubmitRequest = (pairIndex: number): void => {
    setPendingRequests((prev) => ({ ...prev, [pairIndex]: { ...requestForm } }))
    setEditingPair(null)
  }

  // ── Render ──────────────────────────────────────────────────────────────
  const clockLabel = hasOpenPair
    ? t('dashboard.fichaje.clockOutButton', { defaultValue: 'Fichar salida' })
    : t('dashboard.fichaje.clockInButton', { defaultValue: 'Fichar' })

  const showLowerSection = pairs.length > 0
  const showClockCTA = isSelectedToday
  const mutationError = clockInMutation.error ?? clockOutMutation.error

  return (
    <div className="h-full flex flex-col p-2 sm:p-3">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-odoo-purple/10 text-odoo-purple dark:bg-odoo-dark-purple/15 dark:text-odoo-dark-purple"
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <h3 className="text-sm font-display font-semibold text-text-primary dark:text-text-dark-primary truncate">
            {t('dashboard.fichaje.dailyTitle', { defaultValue: 'Fichajes del día' })}
          </h3>
        </div>
        <DateChip
          selectedDate={selectedDate}
          onChange={handleDatePicked}
          dateLocale={dateLocale}
        />
      </div>

      {/* ── Identidad del usuario + Total trabajado ────────────────────── */}
      <div className="pb-3 flex items-center gap-3">
        <ProfileAvatar name={displayName} initials={displayInitials} size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display font-semibold text-text-primary dark:text-text-dark-primary truncate">
            {displayName || t('dashboard.fichaje.dailyTitle', { defaultValue: 'Usuario' })}
          </p>
          {displaySubtitle && (
            <p className="text-2xs text-text-muted dark:text-text-dark-muted truncate">
              {displaySubtitle}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xs uppercase tracking-wider text-text-muted dark:text-text-dark-muted">
            {t('dashboard.fichaje.totalWorked', { defaultValue: 'Total trabajado' })}
          </p>
          <p className="text-xl font-display font-bold text-text-primary dark:text-text-dark-primary tabular-nums leading-tight">
            {formatHours(totalMs)}
          </p>
        </div>
      </div>

      {/* ── Barra de progreso de la jornada ────────────────────────────── */}
      {!loading && !error && pairs.length > 0 && (
        <div className="pb-4">
          <DayProgressBar pairs={pairs} showNowMarker={isSelectedToday} />
        </div>
      )}

      {/* ── Cuerpo (timeline o CTA) ────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center py-6">
            <div className="h-6 w-24 bg-ui-border-l dark:bg-ui-dark-border rounded animate-pulse" />
          </div>
        )}

        {error && !loading && (
          <p role="alert" aria-live="assertive" className="text-danger dark:text-danger text-sm text-center py-4">
            {error}
          </p>
        )}

        {!loading && !error && !showLowerSection && (
          <div className="flex flex-col items-center justify-center py-4 gap-2">
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary text-center">
              {t('dashboard.fichaje.noEntries')}
            </p>
            {showClockCTA && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleClockToggle}
                disabled={clockPending}
              >
                {clockPending
                  ? t('dashboard.fichaje.clockingIn', { defaultValue: 'Fichando…' })
                  : t('dashboard.fichaje.clockInButton', { defaultValue: 'Fichar' })}
              </Button>
            )}
          </div>
        )}

        {!loading && !error && showLowerSection && (
          <ol className="space-y-2">
            {pairs.map((pair, pairIndex) => {
              const pending = pendingRequests[pairIndex]
              const isEditing = editingPair === pairIndex
              const isOpenPair = pair.salida === null
              const durationMs = pair.salida
                ? (pair.salida.timestamp instanceof Date
                    ? pair.salida.timestamp
                    : new Date(pair.salida.timestamp)).getTime()
                  - (pair.entrada.timestamp instanceof Date
                    ? pair.entrada.timestamp
                    : new Date(pair.entrada.timestamp)).getTime()
                : null

              return (
                <li
                  key={`pair-${pairIndex}`}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-ui-body/40 dark:hover:bg-ui-dark-bg/40 transition-colors"
                >
                  {/* ── Entrada ─────────────────────────────────────── */}
                  <EventCell
                    type="in"
                    timestamp={pair.entrada.timestamp}
                    isEditing={isEditing}
                    pending={Boolean(pending)}
                    editValue={requestForm.from}
                    onEditChange={(value) => setRequestForm((f) => ({ ...f, from: value }))}
                    onOpenEdit={() => handleOpenEdit(pairIndex)}
                    label={t('dashboard.fichaje.entrada', { defaultValue: 'Entrada' })}
                    requestModificationLabel={t('dashboard.fichaje.requestModification')}
                  />

                  <span aria-hidden="true" className="text-text-muted dark:text-text-dark-muted text-xs shrink-0">
                    →
                  </span>

                  {/* ── Salida ──────────────────────────────────────── */}
                  {isOpenPair ? (
                    <span className="flex-1 min-w-0 inline-flex items-center gap-1.5 text-2xs text-warning-dark dark:text-warning italic">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" aria-hidden="true" />
                      {t('states.inProgress')}
                    </span>
                  ) : (
                    <EventCell
                      type={pair.autoClose ? 'auto' : 'out'}
                      timestamp={pair.salida!.timestamp}
                      isEditing={isEditing}
                      pending={Boolean(pending)}
                      editValue={requestForm.to}
                      onEditChange={(value) => setRequestForm((f) => ({ ...f, to: value }))}
                      onOpenEdit={() => handleOpenEdit(pairIndex)}
                      label={
                        pair.autoClose
                          ? t('dashboard.fichaje.salidaNoFichada')
                          : t('dashboard.fichaje.salida', { defaultValue: 'Salida' })
                      }
                      requestModificationLabel={t('dashboard.fichaje.requestModification')}
                    />
                  )}

                  {/* ── Duración / acciones ─────────────────────────── */}
                  <div className="shrink-0 flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <Button variant="primary" size="xs" onClick={() => handleSubmitRequest(pairIndex)}>
                          {t('dashboard.fichaje.submitModification')}
                        </Button>
                        <Button variant="ghost" size="xs" onClick={() => setEditingPair(null)}>
                          {t('actions.cancel')}
                        </Button>
                      </>
                    ) : pending ? (
                      <span
                        className="text-2xs px-1.5 py-0.5 rounded-full bg-warning-light dark:bg-warning-dark/30 text-warning-dark dark:text-warning font-medium"
                        title={`${pending.from} → ${pending.to}`}
                      >
                        {t('dashboard.fichaje.pendingApproval')}
                      </span>
                    ) : durationMs != null ? (
                      <span className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary tabular-nums">
                        {formatHours(durationMs)}
                      </span>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      {/* ── CTA inferior cuando ya hay fichajes hoy ─────────────────────── */}
      {!loading && !error && showLowerSection && showClockCTA && (
        <div className="pt-3 mt-3 border-t border-ui-border-l dark:border-ui-dark-border flex items-center justify-end gap-3">
          {mutationError instanceof Error && (
            <span className="text-2xs text-danger" role="alert">
              {mutationError.message}
            </span>
          )}
          <Button
            variant={hasOpenPair ? 'outline' : 'primary'}
            size="sm"
            onClick={handleClockToggle}
            disabled={clockPending}
          >
            {clockPending
              ? t('dashboard.fichaje.clockingIn', { defaultValue: 'Fichando…' })
              : clockLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

export default DailyFichajesWidget
