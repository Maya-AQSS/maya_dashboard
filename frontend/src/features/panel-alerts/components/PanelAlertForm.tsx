import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Select,
  TextInput,
  datetimeLocalToIso,
  toDatetimeLocalValue,
} from '@ceedcv-maya/shared-ui-react'
import { MayaEditor } from '@ceedcv-maya/shared-editor-react'
import { useDarkMode } from '@ceedcv-maya/shared-layout-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { AlertAudienceFields } from './AlertAudienceFields'
import { CronSchedulePicker } from './CronSchedulePicker'
import {
  audienceFormStateFromApi,
  buildAudiencePayload,
  defaultAudienceFormState,
  validateAudienceForm,
  type AlertAudienceFormState,
} from '../types/alertAudience'
import type { CreatePanelAlertInput, PanelAlert, Severity } from '../types/panelAlert'
import { useLanguages } from '../../languages/useLanguages'

interface Props {
  initial?: PanelAlert | null
  onSubmit: (data: CreatePanelAlertInput) => Promise<unknown>
  onCancel: () => void
  loading?: boolean
}

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info']

type LocaleMap = Record<string, string>

/** Mapa inicial de un campo: usa translations si existe, si no el escalar legacy. */
function initialMap(
  fromTranslations: Record<string, string> | undefined,
  legacyValue: string | null | undefined,
  defaultLocale: string,
): LocaleMap {
  if (fromTranslations && Object.keys(fromTranslations).length > 0) return { ...fromTranslations }
  if (legacyValue) return { [defaultLocale]: legacyValue }
  return {}
}

/** Solo entradas con texto no vacío. */
function nonEmpty(map: LocaleMap): LocaleMap {
  const out: LocaleMap = {}
  for (const [k, v] of Object.entries(map)) {
    if (v && v.trim() !== '') out[k] = v
  }
  return out
}

export function PanelAlertForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { t } = useLocale()
  const { isDark } = useDarkMode()
  const { languages, defaultLocale: catalogDefault } = useLanguages()

  // El idioma por defecto es el de la alerta (edición) o el del catálogo (alta).
  const defaultLocale = initial?.default_locale ?? catalogDefault

  const [textByLocale, setTextByLocale] = useState<LocaleMap>(() =>
    initialMap(initial?.translations.text, initial?.text, defaultLocale),
  )
  const [labelByLocale, setLabelByLocale] = useState<LocaleMap>(() =>
    initialMap(initial?.translations.action_label, initial?.action_label, defaultLocale),
  )
  const [activeLang, setActiveLang] = useState(defaultLocale)

  const [severity, setSeverity] = useState<Severity>(initial?.severity ?? 'medium')
  const [actionUrl, setActionUrl] = useState(initial?.action_url ?? '')
  const [visibleFrom, setVisibleFrom] = useState(toDatetimeLocalValue(initial?.visible_from))
  const [visibleUntil, setVisibleUntil] = useState(toDatetimeLocalValue(initial?.visible_until))
  const [scheduleCron, setScheduleCron] = useState(initial?.schedule_cron ?? '')
  const [durationMinutes, setDurationMinutes] = useState(
    initial?.duration_minutes != null ? String(initial.duration_minutes) : '',
  )
  const [audience, setAudience] = useState<AlertAudienceFormState>(() =>
    initial ? audienceFormStateFromApi(initial) : defaultAudienceFormState(),
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initial) return
    const dl = initial.default_locale ?? catalogDefault
    setAudience(audienceFormStateFromApi(initial))
    setTextByLocale(initialMap(initial.translations.text, initial.text, dl))
    setLabelByLocale(initialMap(initial.translations.action_label, initial.action_label, dl))
    setActiveLang(dl)
    setSeverity(initial.severity)
    setActionUrl(initial.action_url ?? '')
    setVisibleFrom(toDatetimeLocalValue(initial.visible_from))
    setVisibleUntil(toDatetimeLocalValue(initial.visible_until))
    setScheduleCron(initial.schedule_cron ?? '')
    setDurationMinutes(initial.duration_minutes != null ? String(initial.duration_minutes) : '')
  }, [initial, catalogDefault])

  // Asegura que el idioma activo siga siendo válido si cambia el catálogo.
  const langCodes = useMemo(() => languages.map((l) => l.code), [languages])
  useEffect(() => {
    if (!langCodes.includes(activeLang) && langCodes.length > 0) {
      setActiveLang(defaultLocale)
    }
  }, [langCodes, activeLang, defaultLocale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!(textByLocale[defaultLocale] ?? '').trim()) {
      setError(t('panelAlerts.validation.textRequired'))
      setActiveLang(defaultLocale)
      return
    }
    if (!visibleFrom) { setError(t('panelAlerts.validation.visibleFromRequired')); return }
    if (new Date(visibleFrom) < new Date()) { setError(t('panelAlerts.validation.visibleFromPast')); return }
    const audienceError = validateAudienceForm(audience, {
      teamRequired: t('panelAlerts.validation.teamRequired'),
      studyTypeRequired: t('panelAlerts.validation.studyTypeRequired'),
      studyRequired: t('panelAlerts.validation.studyRequired'),
      moduleRequired: t('panelAlerts.validation.moduleRequired'),
    })
    if (audienceError) { setError(audienceError); return }

    const labels = nonEmpty(labelByLocale)
    try {
      await onSubmit({
        default_locale: defaultLocale,
        translations: {
          text: nonEmpty(textByLocale),
          ...(Object.keys(labels).length > 0 ? { action_label: labels } : {}),
        },
        severity,
        action_url: actionUrl.trim() || null,
        visible_from: datetimeLocalToIso(visibleFrom)!,
        visible_until: visibleUntil ? datetimeLocalToIso(visibleUntil) : null,
        schedule_cron: scheduleCron.trim() || null,
        duration_minutes: durationMinutes.trim() ? Number(durationMinutes) : null,
        ...buildAudiencePayload(audience),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('panelAlerts.errorSave'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Pestañas de idioma: el por defecto es obligatorio (*), el resto opcional. */}
      <div className="flex flex-wrap gap-1 border-b border-ui-border dark:border-ui-dark-border">
        {languages.map((l) => {
          const filled = (textByLocale[l.code] ?? '').trim() !== ''
          const isActive = l.code === activeLang
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveLang(l.code)}
              className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
                  ? 'border-odoo-purple dark:border-odoo-dark-purple text-odoo-purple dark:text-odoo-dark-purple'
                  : 'border-transparent text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary'
              }`}
            >
              {t(`languageNames.${l.code}`, { defaultValue: l.name })}
              {l.code === defaultLocale && <span className="text-danger"> *</span>}
              {filled && l.code !== defaultLocale && <span className="ml-1 text-success">●</span>}
            </button>
          )
        })}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          {t('panelAlerts.fields.text')}
          {activeLang === defaultLocale && <span className="text-danger"> *</span>}
        </label>
        <MayaEditor
          key={activeLang}
          mode="lite"
          isDark={isDark}
          initialContent={textByLocale[activeLang] ?? ''}
          onChange={(v) => setTextByLocale((prev) => ({ ...prev, [activeLang]: v }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          {t('panelAlerts.fields.actionLabel')}
        </label>
        <TextInput
          fieldSize="sm"
          value={labelByLocale[activeLang] ?? ''}
          onChange={(e) => setLabelByLocale((prev) => ({ ...prev, [activeLang]: e.target.value }))}
          placeholder={t('panelAlerts.fields.actionLabelPlaceholder')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          {t('panelAlerts.fields.severity')} <span className="text-danger">*</span>
        </label>
        <Select
          fieldSize="sm"
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity)}
        >
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>{t(`severity.${s}`)}</option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          {t('panelAlerts.fields.actionUrl')}
        </label>
        <TextInput
          fieldSize="sm"
          type="url"
          value={actionUrl}
          onChange={(e) => setActionUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <AlertAudienceFields value={audience} onChange={setAudience} disabled={loading} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            {t('panelAlerts.fields.visibleFrom')} <span className="text-danger">*</span>
          </label>
          <TextInput
            fieldSize="sm"
            type="datetime-local"
            value={visibleFrom}
            onChange={(e) => setVisibleFrom(e.target.value)}
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            {t('panelAlerts.fields.visibleUntil')}
          </label>
          <TextInput
            fieldSize="sm"
            type="datetime-local"
            value={visibleUntil}
            onChange={(e) => setVisibleUntil(e.target.value)}
            min={visibleFrom}
          />
        </div>
      </div>

      {/* Recurrence (optional): cron + window duration. When set, the alert
          re-appears on each cron tick for `duration_minutes`. */}
      <fieldset className="border border-ui-border dark:border-ui-dark-border rounded-md p-3">
        <legend className="px-1 text-sm font-medium text-text-secondary dark:text-text-dark-secondary">
          {t('panelAlerts.recurrence.legend')}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
              {t('panelAlerts.fields.scheduleCron')}
            </label>
            <CronSchedulePicker value={scheduleCron} onChange={setScheduleCron} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
              {t('panelAlerts.fields.durationMinutes')}
            </label>
            <TextInput
              fieldSize="sm"
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="120"
            />
            <p className="mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
              {t('panelAlerts.recurrence.durationHelp')}
            </p>
          </div>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-danger">{error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={loading}>
          {t('actions.cancel')}
        </Button>
        <Button variant="primary" size="sm" type="submit" disabled={loading}>
          {loading ? t('actions.saving') : initial ? t('actions.save') : t('actions.create')}
        </Button>
      </div>
    </form>
  )
}
