import { useEffect, useState } from 'react'
import { Button, Select, TextInput } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { AlertAudienceFields } from './AlertAudienceFields'
import {
  audienceFormStateFromApi,
  buildAudiencePayload,
  defaultAudienceFormState,
  validateAudienceForm,
  type AlertAudienceFormState,
} from '../types/alertAudience'
import { useNotificationDefinitions } from '../hooks/useNotificationDefinitions'
import type { CreateNotificationRuleInput, NotificationRule } from '../types/notificationRule'
import type { Severity } from '../types/systemNotification'

interface Props {
  initial?: NotificationRule | null
  onSubmit: (data: CreateNotificationRuleInput) => Promise<unknown>
  onCancel: () => void
  loading?: boolean
}

interface ParamRow {
  key: string
  value: string
}

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info']

function paramsToRows(params: Record<string, unknown> | undefined): ParamRow[] {
  if (!params) return []
  return Object.entries(params).map(([key, value]) => ({ key, value: String(value) }))
}

function rowsToParams(rows: ParamRow[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const r of rows) {
    if (!r.key.trim()) continue
    // Numeric-looking values become numbers (thresholds, windows, days).
    const n = Number(r.value)
    out[r.key.trim()] = r.value.trim() !== '' && !Number.isNaN(n) ? n : r.value
  }
  return out
}

export function NotificationRuleForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { t } = useLocale()
  const { definitions } = useNotificationDefinitions({ category: 'scheduled' })

  const [evaluatorKey, setEvaluatorKey] = useState(initial?.evaluator_key ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [scheduleCron, setScheduleCron] = useState(initial?.schedule_cron ?? '0 7 * * *')
  const [severity, setSeverity] = useState<Severity | ''>(initial?.severity ?? '')
  const [enabled, setEnabled] = useState(initial?.enabled ?? true)
  const [paramRows, setParamRows] = useState<ParamRow[]>(paramsToRows(initial?.params))
  const [audience, setAudience] = useState<AlertAudienceFormState>(() =>
    initial ? audienceFormStateFromApi(initial) : defaultAudienceFormState(),
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setEvaluatorKey(initial.evaluator_key)
      setName(initial.name)
      setDescription(initial.description ?? '')
      setScheduleCron(initial.schedule_cron)
      setSeverity(initial.severity ?? '')
      setEnabled(initial.enabled)
      setParamRows(paramsToRows(initial.params))
      setAudience(audienceFormStateFromApi(initial))
    }
  }, [initial])

  const setRow = (i: number, patch: Partial<ParamRow>) =>
    setParamRows((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!evaluatorKey) { setError(t('scheduledRules.validation.evaluatorRequired')); return }
    if (!name.trim()) { setError(t('scheduledRules.validation.nameRequired')); return }
    if (!scheduleCron.trim()) { setError(t('scheduledRules.validation.cronRequired')); return }
    const audienceError = validateAudienceForm(audience, {
      teamRequired: t('panelAlerts.validation.teamRequired'),
      studyTypeRequired: t('panelAlerts.validation.studyTypeRequired'),
      studyRequired: t('panelAlerts.validation.studyRequired'),
      moduleRequired: t('panelAlerts.validation.moduleRequired'),
    })
    if (audienceError) { setError(audienceError); return }

    try {
      await onSubmit({
        evaluator_key: evaluatorKey,
        name: name.trim(),
        description: description.trim() || null,
        params: rowsToParams(paramRows),
        schedule_cron: scheduleCron.trim(),
        severity: severity || null,
        enabled,
        ...buildAudiencePayload(audience),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('scheduledRules.errorSave'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.evaluator')} <span className="text-danger">*</span></label>
          <Select fieldSize="sm" value={evaluatorKey} onChange={(e) => setEvaluatorKey(e.target.value)} disabled={!!initial}>
            <option value="">—</option>
            {definitions.map((d) => (
              <option key={d.key} value={d.key}>{d.label} ({d.source_app})</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.name')} <span className="text-danger">*</span></label>
          <TextInput fieldSize="sm" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.description')}</label>
        <TextInput fieldSize="sm" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.scheduleCron')} <span className="text-danger">*</span></label>
          <TextInput fieldSize="sm" value={scheduleCron} onChange={(e) => setScheduleCron(e.target.value)} placeholder="0 7 * * *" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.severityOverride')}</label>
          <Select fieldSize="sm" value={severity} onChange={(e) => setSeverity(e.target.value as Severity | '')}>
            <option value="">{t('scheduledRules.useDefaultSeverity')}</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{t(`severity.${s}`)}</option>)}
          </Select>
        </div>
      </div>

      {/* Params editor (key/value). Evaluator-specific: threshold, days, window_seconds, ... */}
      <div>
        <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.params')}</label>
        <div className="space-y-2">
          {paramRows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <TextInput fieldSize="sm" value={row.key} onChange={(e) => setRow(i, { key: e.target.value })} placeholder={t('scheduledRules.paramKey')} />
              <TextInput fieldSize="sm" value={row.value} onChange={(e) => setRow(i, { value: e.target.value })} placeholder={t('scheduledRules.paramValue')} />
              <Button variant="outline" size="xs" type="button" onClick={() => setParamRows((rows) => rows.filter((_, idx) => idx !== i))}>×</Button>
            </div>
          ))}
          <Button variant="outline" size="xs" type="button" onClick={() => setParamRows((rows) => [...rows, { key: '', value: '' }])}>
            + {t('scheduledRules.addParam')}
          </Button>
        </div>
      </div>

      <AlertAudienceFields value={audience} onChange={setAudience} disabled={loading} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        {t('scheduledRules.fields.enabled')}
      </label>

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={loading}>{t('actions.cancel')}</Button>
        <Button variant="primary" size="sm" type="submit" disabled={loading}>
          {loading ? t('actions.saving') : initial ? t('actions.save') : t('actions.create')}
        </Button>
      </div>
    </form>
  )
}
