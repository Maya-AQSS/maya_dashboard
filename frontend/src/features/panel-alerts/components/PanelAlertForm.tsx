import { useEffect, useState } from 'react'
import { Button, Select, TextInput } from '@ceedcv-maya/shared-ui-react'
import { MayaEditor } from '@ceedcv-maya/shared-editor-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import type { CreatePanelAlertInput, PanelAlert, Severity } from '../types/panelAlert'

interface Props {
  initial?: PanelAlert | null
  onSubmit: (data: CreatePanelAlertInput) => Promise<unknown>
  onCancel: () => void
  loading?: boolean
}

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low']

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}

export function PanelAlertForm({ initial, onSubmit, onCancel, loading }: Props) {
  const { t } = useLocale()

  const [text, setText] = useState(initial?.text ?? '')
  const [severity, setSeverity] = useState<Severity>(initial?.severity ?? 'medium')
  const [actionLabel, setActionLabel] = useState(initial?.action_label ?? '')
  const [actionUrl, setActionUrl] = useState(initial?.action_url ?? '')
  const [visibleFrom, setVisibleFrom] = useState(toDatetimeLocal(initial?.visible_from))
  const [visibleUntil, setVisibleUntil] = useState(toDatetimeLocal(initial?.visible_until))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setText(initial.text)
      setSeverity(initial.severity)
      setActionLabel(initial.action_label ?? '')
      setActionUrl(initial.action_url ?? '')
      setVisibleFrom(toDatetimeLocal(initial.visible_from))
      setVisibleUntil(toDatetimeLocal(initial.visible_until))
    }
  }, [initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!text.trim()) { setError(t('panelAlerts.validation.textRequired')); return }
    if (!visibleFrom) { setError(t('panelAlerts.validation.visibleFromRequired')); return }
    try {
      await onSubmit({
        text: text.trim(),
        severity,
        action_label: actionLabel.trim() || null,
        action_url: actionUrl.trim() || null,
        visible_from: new Date(visibleFrom).toISOString(),
        visible_until: visibleUntil ? new Date(visibleUntil).toISOString() : null,
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
        <MayaEditor mode="lite" initialContent={text} onChange={setText} />
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
