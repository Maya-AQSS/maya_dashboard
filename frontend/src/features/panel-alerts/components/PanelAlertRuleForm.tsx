import { useEffect, useState } from 'react'
import { Button, Select, TextInput } from '@ceedcv-maya/shared-ui-react'
import { MayaEditor } from '@ceedcv-maya/shared-editor-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import type { AlertCondition, CreatePanelAlertRuleInput, PanelAlertRule, Severity } from '../types/panelAlert'

interface Props {
  initial?: PanelAlertRule | null
  onSubmit: (data: CreatePanelAlertRuleInput) => Promise<unknown>
  onCancel: () => void
  loading?: boolean
}

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low']
const OPERATORS = ['=', '!=', '>', '<', 'contains', 'starts_with']

const COMMON_EVENT_TYPES = [
  'manual',
  'user.login',
  'user.login_new_ip',
  'fichaje.missing',
  'fichaje.overtime',
  'system.maintenance',
  'notification.received',
]

export function PanelAlertRuleForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { t } = useLocale()

  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [eventType, setEventType] = useState(initial?.event_type ?? 'manual')
  const [customEventType, setCustomEventType] = useState('')
  const [conditions, setConditions] = useState<AlertCondition[]>(initial?.conditions ?? [])
  const [alertText, setAlertText] = useState(initial?.alert_text ?? '')
  const [severity, setSeverity] = useState<Severity>(initial?.severity ?? 'medium')
  const [actionLabel, setActionLabel] = useState(initial?.action_label ?? '')
  const [actionUrl, setActionUrl] = useState(initial?.action_url ?? '')
  const [visibleDurationHours, setVisibleDurationHours] = useState(
    initial?.visible_duration_hours != null ? String(initial.visible_duration_hours) : '',
  )
  const [maxFrequencyMinutes, setMaxFrequencyMinutes] = useState(
    initial?.max_frequency_minutes != null ? String(initial.max_frequency_minutes) : '60',
  )
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [error, setError] = useState<string | null>(null)

  const isCustomEventType = !COMMON_EVENT_TYPES.includes(eventType)

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setDescription(initial.description ?? '')
      const knownType = COMMON_EVENT_TYPES.includes(initial.event_type)
      setEventType(knownType ? initial.event_type : 'custom')
      if (!knownType) setCustomEventType(initial.event_type)
      setConditions(initial.conditions ?? [])
      setAlertText(initial.alert_text)
      setSeverity(initial.severity)
      setActionLabel(initial.action_label ?? '')
      setActionUrl(initial.action_url ?? '')
      setVisibleDurationHours(initial.visible_duration_hours != null ? String(initial.visible_duration_hours) : '')
      setMaxFrequencyMinutes(initial.max_frequency_minutes != null ? String(initial.max_frequency_minutes) : '60')
      setIsActive(initial.is_active)
    }
  }, [initial])

  const addCondition = () =>
    setConditions((c) => [...c, { key: '', operator: '=', value: '' }])

  const removeCondition = (i: number) =>
    setConditions((c) => c.filter((_, idx) => idx !== i))

  const updateCondition = (i: number, patch: Partial<AlertCondition>) =>
    setConditions((c) => c.map((cond, idx) => (idx === i ? { ...cond, ...patch } : cond)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const resolvedEventType = eventType === 'custom' ? customEventType.trim() : eventType
    if (!name.trim()) { setError(t('panelAlerts.validation.nameRequired')); return }
    if (!resolvedEventType) { setError(t('panelAlerts.validation.eventTypeRequired')); return }
    if (!alertText.trim()) { setError(t('panelAlerts.validation.alertTextRequired')); return }
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        event_type: resolvedEventType,
        conditions: conditions.filter((c) => c.key.trim()) || null,
        alert_text: alertText.trim(),
        severity,
        action_label: actionLabel.trim() || null,
        action_url: actionUrl.trim() || null,
        visible_duration_hours: visibleDurationHours ? parseInt(visibleDurationHours, 10) : null,
        max_frequency_minutes: maxFrequencyMinutes ? parseInt(maxFrequencyMinutes, 10) : null,
        is_active: isActive,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('panelAlerts.errorSave'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            {t('panelAlerts.fields.ruleName')} <span className="text-danger">*</span>
          </label>
          <TextInput
            fieldSize="sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            {t('panelAlerts.fields.description')}
          </label>
          <TextInput
            fieldSize="sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            {t('panelAlerts.fields.eventType')} <span className="text-danger">*</span>
          </label>
          <Select
            fieldSize="sm"
            value={isCustomEventType ? 'custom' : eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            {COMMON_EVENT_TYPES.map((et) => (
              <option key={et} value={et}>{et}</option>
            ))}
            <option value="custom">{t('panelAlerts.fields.customEventType')}</option>
          </Select>
          {(eventType === 'custom' || isCustomEventType) && (
            <TextInput
              fieldSize="sm"
              className="mt-1"
              value={customEventType}
              onChange={(e) => setCustomEventType(e.target.value)}
              placeholder={t('panelAlerts.fields.customEventTypePlaceholder')}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            {t('panelAlerts.fields.severity')} <span className="text-danger">*</span>
          </label>
          <Select fieldSize="sm" value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{t(`severity.${s}`)}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
            {t('panelAlerts.fields.conditions')}
          </label>
          <Button variant="outline" size="xs" type="button" onClick={addCondition}>
            + {t('panelAlerts.addCondition')}
          </Button>
        </div>
        {conditions.map((cond, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <TextInput
              fieldSize="sm"
              placeholder={t('panelAlerts.fields.conditionKey')}
              value={cond.key}
              onChange={(e) => updateCondition(i, { key: e.target.value })}
              className="flex-1"
            />
            <Select
              fieldSize="sm"
              value={cond.operator}
              onChange={(e) => updateCondition(i, { operator: e.target.value })}
            >
              {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
            </Select>
            <TextInput
              fieldSize="sm"
              placeholder={t('panelAlerts.fields.conditionValue')}
              value={cond.value}
              onChange={(e) => updateCondition(i, { value: e.target.value })}
              className="flex-1"
            />
            <Button variant="danger" size="xs" type="button" onClick={() => removeCondition(i)}>×</Button>
          </div>
        ))}
        <p className="text-xs text-text-muted dark:text-text-dark-muted mt-1">
          {t('panelAlerts.fields.conditionsHint')}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          {t('panelAlerts.fields.alertText')} <span className="text-danger">*</span>
        </label>
        <MayaEditor
          mode="lite"
          initialContent={alertText}
          onChange={setAlertText}
          placeholder={t('panelAlerts.fields.alertTextPlaceholder')}
        />
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
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            {t('panelAlerts.fields.actionUrl')}
          </label>
          <TextInput fieldSize="sm" type="url" value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            {t('panelAlerts.fields.visibleDurationHours')}
          </label>
          <TextInput
            fieldSize="sm"
            type="number"
            min="1"
            value={visibleDurationHours}
            onChange={(e) => setVisibleDurationHours(e.target.value)}
            placeholder={t('panelAlerts.fields.visibleDurationHoursPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
            {t('panelAlerts.fields.maxFrequencyMinutes')}
          </label>
          <TextInput
            fieldSize="sm"
            type="number"
            min="1"
            value={maxFrequencyMinutes}
            onChange={(e) => setMaxFrequencyMinutes(e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-ui-border"
        />
        <span className="text-sm text-text-primary dark:text-text-dark-primary">
          {t('panelAlerts.fields.isActive')}
        </span>
      </label>

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
