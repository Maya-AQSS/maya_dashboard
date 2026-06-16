import { useEffect, useState } from 'react'
import { Select, TextInput } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'

type Preset = 'daily' | 'weekly' | 'monthly' | 'hourly' | 'custom'

interface CronState {
  preset: Preset
  hour: string        // '00'–'23'
  minute: string      // '00'–'59'
  dayOfWeek: string   // '0'–'6' (0 = domingo)
  dayOfMonth: string  // '1'–'28'
  everyHours: string  // '1'–'12'
  rawCron: string
}

function toCron(s: CronState): string {
  const h = s.hour.padStart(2, '0')
  const m = s.minute.padStart(2, '0')
  switch (s.preset) {
    case 'daily':   return `${Number(m)} ${Number(h)} * * *`
    case 'weekly':  return `${Number(m)} ${Number(h)} * * ${s.dayOfWeek}`
    case 'monthly': return `${Number(m)} ${Number(h)} ${s.dayOfMonth} * *`
    case 'hourly':  return `0 */${s.everyHours} * * *`
    default:        return s.rawCron
  }
}

function parseCron(cron: string): CronState {
  const base: CronState = {
    preset: 'custom', hour: '07', minute: '00',
    dayOfWeek: '1', dayOfMonth: '1', everyHours: '1', rawCron: cron,
  }
  if (!cron) return { ...base, preset: 'daily', rawCron: '' }

  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return base

  const [min, hr, dom, , dow] = parts

  // daily: M H * * *
  if (dom === '*' && dow === '*' && !hr.startsWith('*/') && !min.startsWith('*/')) {
    return { ...base, preset: 'daily', hour: hr.padStart(2, '0'), minute: min.padStart(2, '0'), rawCron: cron }
  }
  // weekly: M H * * DOW
  if (dom === '*' && dow !== '*' && !hr.startsWith('*/')) {
    return { ...base, preset: 'weekly', hour: hr.padStart(2, '0'), minute: min.padStart(2, '0'), dayOfWeek: dow, rawCron: cron }
  }
  // monthly: M H D * *
  if (dom !== '*' && dow === '*' && !hr.startsWith('*/')) {
    return { ...base, preset: 'monthly', hour: hr.padStart(2, '0'), minute: min.padStart(2, '0'), dayOfMonth: dom, rawCron: cron }
  }
  // hourly: 0 */N * * *
  if (min === '0' && hr.startsWith('*/')) {
    return { ...base, preset: 'hourly', everyHours: hr.slice(2), rawCron: cron }
  }

  return base
}

const DOW_OPTIONS = [
  { value: '1', labelKey: 'schedule.monday' },
  { value: '2', labelKey: 'schedule.tuesday' },
  { value: '3', labelKey: 'schedule.wednesday' },
  { value: '4', labelKey: 'schedule.thursday' },
  { value: '5', labelKey: 'schedule.friday' },
  { value: '6', labelKey: 'schedule.saturday' },
  { value: '0', labelKey: 'schedule.sunday' },
]

interface Props {
  value: string
  onChange: (cron: string) => void
  disabled?: boolean
}

export function CronSchedulePicker({ value, onChange, disabled }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<CronState>(() => parseCron(value))

  useEffect(() => {
    setState(parseCron(value))
  }, [value])

  const update = (patch: Partial<CronState>) => {
    const next = { ...state, ...patch }
    setState(next)
    onChange(toCron(next))
  }

  const PRESETS: { value: Preset; label: string }[] = [
    { value: 'daily',   label: t('schedule.daily') },
    { value: 'weekly',  label: t('schedule.weekly') },
    { value: 'monthly', label: t('schedule.monthly') },
    { value: 'hourly',  label: t('schedule.hourly') },
    { value: 'custom',  label: t('schedule.custom') },
  ]

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
  const minutes = ['00', '05', '10', '15', '20', '30', '45']
  const domOptions = Array.from({ length: 28 }, (_, i) => String(i + 1))

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto">
      <Select
        fieldSize="sm"
        value={state.preset}
        onChange={(e) => update({ preset: e.target.value as Preset })}
        disabled={disabled}
        className="!w-auto"
      >
        {PRESETS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </Select>

      {state.preset === 'weekly' && (
        <>
          <span className="text-sm text-text-secondary dark:text-text-dark-secondary whitespace-nowrap">{t('schedule.onDay')}</span>
          <Select fieldSize="sm" value={state.dayOfWeek} onChange={(e) => update({ dayOfWeek: e.target.value })} disabled={disabled} className="!w-auto">
            {DOW_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{t(d.labelKey)}</option>
            ))}
          </Select>
        </>
      )}

      {state.preset === 'monthly' && (
        <>
          <span className="text-sm text-text-secondary dark:text-text-dark-secondary whitespace-nowrap">{t('schedule.onDayOfMonth')}</span>
          <Select fieldSize="sm" value={state.dayOfMonth} onChange={(e) => update({ dayOfMonth: e.target.value })} disabled={disabled} className="!w-14">
            {domOptions.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
        </>
      )}

      {(state.preset === 'daily' || state.preset === 'weekly' || state.preset === 'monthly') && (
        <>
          <span className="text-sm text-text-secondary dark:text-text-dark-secondary whitespace-nowrap">{t('schedule.at')}</span>
          <Select fieldSize="sm" value={state.hour} onChange={(e) => update({ hour: e.target.value })} disabled={disabled} className="!w-14">
            {hours.map((h) => <option key={h} value={h}>{h}</option>)}
          </Select>
          <span className="text-sm font-medium">:</span>
          <Select fieldSize="sm" value={state.minute} onChange={(e) => update({ minute: e.target.value })} disabled={disabled} className="!w-14">
            {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </>
      )}

      {state.preset === 'hourly' && (
        <>
          <span className="text-sm text-text-secondary dark:text-text-dark-secondary whitespace-nowrap">{t('schedule.everyNHours')}</span>
          <Select fieldSize="sm" value={state.everyHours} onChange={(e) => update({ everyHours: e.target.value })} disabled={disabled} className="!w-14">
            {['1','2','3','4','6','8','12'].map((n) => (
              <option key={n} value={n}>{n}h</option>
            ))}
          </Select>
        </>
      )}

      {state.preset === 'custom' && (
        <>
          <TextInput
            fieldSize="sm"
            value={state.rawCron}
            onChange={(e) => update({ rawCron: e.target.value })}
            placeholder="0 7 * * 1"
            disabled={disabled}
            className="!w-36 font-mono"
          />
          <span className="text-xs text-text-secondary dark:text-text-dark-secondary whitespace-nowrap">
            {t('schedule.customHint')}
          </span>
        </>
      )}
    </div>
  )
}
