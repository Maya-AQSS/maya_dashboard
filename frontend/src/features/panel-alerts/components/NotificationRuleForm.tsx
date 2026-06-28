import { useEffect, useState } from 'react'
import { Button, Select, TextInput } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { AlertAudienceFields } from './AlertAudienceFields'
import { ConditionBuilder } from './ConditionBuilder'
import { CronSchedulePicker } from './CronSchedulePicker'
import {
  audienceFormStateFromApi,
  buildAudiencePayload,
  defaultAudienceFormState,
  validateAudienceForm,
  type AlertAudienceFormState,
} from '../types/alertAudience'
import type { CreateNotificationRuleInput, NotificationRule, RuleConditions } from '../types/notificationRule'
import type { Severity } from '../types/systemNotification'

interface Props {
  initial?: NotificationRule | null
  onSubmit: (data: CreateNotificationRuleInput) => Promise<unknown>
  onCancel: () => void
  loading?: boolean
}

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info']
const EVALUATOR_KEY = 'dms.generic_condition'

export function NotificationRuleForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { t } = useLocale()

  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [scheduleCron, setScheduleCron] = useState(initial?.schedule_cron ?? '0 7 * * *')
  const [severity, setSeverity] = useState<Severity | ''>(initial?.severity ?? '')
  const [enabled, setEnabled] = useState(initial?.enabled ?? true)
  const [conditions, setConditions] = useState<RuleConditions | null>(initial?.conditions ?? null)
  const [audience, setAudience] = useState<AlertAudienceFormState>(() =>
    initial ? audienceFormStateFromApi(initial) : defaultAudienceFormState(),
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setDescription(initial.description ?? '')
      setScheduleCron(initial.schedule_cron)
      setSeverity(initial.severity ?? '')
      setEnabled(initial.enabled)
      setConditions(initial.conditions ?? null)
      setAudience(audienceFormStateFromApi(initial))
    }
  }, [initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
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
        evaluator_key: EVALUATOR_KEY,
        name: name.trim(),
        description: description.trim() || null,
        params: {},
        conditions: conditions ?? null,
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
          <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.name')} <span className="text-danger">*</span></label>
          <TextInput fieldSize="sm" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.severityOverride')}</label>
          <Select fieldSize="sm" value={severity} onChange={(e) => setSeverity(e.target.value as Severity | '')}>
            <option value="">{t('scheduledRules.useDefaultSeverity')}</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{t(`severity.${s}`)}</option>)}
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.description')}</label>
        <TextInput fieldSize="sm" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.scheduleCron')} <span className="text-danger">*</span></label>
        <CronSchedulePicker value={scheduleCron} onChange={setScheduleCron} disabled={loading} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t('scheduledRules.fields.conditions')}</label>
        <ConditionBuilder value={conditions} onChange={setConditions} disabled={loading} />
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
