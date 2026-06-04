import { useEffect, useState } from 'react'
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
import {
  audienceFormStateFromApi,
  buildAudiencePayload,
  defaultAudienceFormState,
  validateAudienceForm,
  type AlertAudienceFormState,
} from '../types/alertAudience'
import type { CreatePanelAlertInput, PanelAlert, Severity } from '../types/panelAlert'

interface Props {
  initial?: PanelAlert | null
  onSubmit: (data: CreatePanelAlertInput) => Promise<unknown>
  onCancel: () => void
  loading?: boolean
}

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info']

export function PanelAlertForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { t } = useLocale()
  const { isDark } = useDarkMode()

  const [text, setText] = useState(initial?.text ?? '')
  const [severity, setSeverity] = useState<Severity>(initial?.severity ?? 'medium')
  const [actionLabel, setActionLabel] = useState(initial?.action_label ?? '')
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
    if (initial) {
      setAudience(audienceFormStateFromApi(initial))
      setText(initial.text)
      setSeverity(initial.severity)
      setActionLabel(initial.action_label ?? '')
      setActionUrl(initial.action_url ?? '')
      setVisibleFrom(toDatetimeLocalValue(initial.visible_from))
      setVisibleUntil(toDatetimeLocalValue(initial.visible_until))
      setScheduleCron(initial.schedule_cron ?? '')
      setDurationMinutes(initial.duration_minutes != null ? String(initial.duration_minutes) : '')
    }
  }, [initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!text.trim()) { setError(t('panelAlerts.validation.textRequired')); return }
    if (!visibleFrom) { setError(t('panelAlerts.validation.visibleFromRequired')); return }
    const audienceError = validateAudienceForm(audience, {
      teamRequired: t('panelAlerts.validation.teamRequired'),
      studyTypeRequired: t('panelAlerts.validation.studyTypeRequired'),
      studyRequired: t('panelAlerts.validation.studyRequired'),
      moduleRequired: t('panelAlerts.validation.moduleRequired'),
    })
    if (audienceError) { setError(audienceError); return }
    try {
      await onSubmit({
        text: text.trim(),
        severity,
        action_label: actionLabel.trim() || null,
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
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          {t('panelAlerts.fields.text')} <span className="text-danger">*</span>
        </label>
        <MayaEditor mode="lite" isDark={isDark} initialContent={text} onChange={setText} />
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            {t('panelAlerts.fields.actionLabel')}
          </label>
          <TextInput
            fieldSize="sm"
            value={actionLabel}
            onChange={(e) => setActionLabel(e.target.value)}
            placeholder={t('panelAlerts.fields.actionLabelPlaceholder')}
          />
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
            <TextInput
              fieldSize="sm"
              value={scheduleCron}
              onChange={(e) => setScheduleCron(e.target.value)}
              placeholder="0 9 * * 1"
            />
            <p className="mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
              {t('panelAlerts.recurrence.cronHelp')}
            </p>
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
