import { useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { Button, Checkbox, PageTitle, Select } from '@maya/shared-ui-react'
import { useLocale } from '@maya/shared-i18n-react'
import { useSystemAlerts } from '../hooks/useSystemAlerts'

const SEVERITY_CLASSES = {
  critical: 'border-l-danger',
  high:     'border-l-warning-dark',
  medium:   'border-l-warning',
  low:      'border-l-info',
}

export default function SystemAlertsPage() {
  const { token } = useAuth()
  const { t } = useLocale()
  const [severity, setSeverity] = useState('')
  const [activeOnly, setActiveOnly] = useState(true)

  const { alerts, loading, error, onAcknowledge, onResolve } = useSystemAlerts({
    token, activeOnly, severity: severity || undefined,
  })

  return (
    <div className="max-w-[960px] mx-auto p-4">
      <PageTitle
        title={t('dashboard.systemAlerts.pageTitle')}
        subtitle={t('dashboard.systemAlerts.pageSubtitle')}
      />

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="min-w-[180px]">
          <label className="mb-1 block text-xs font-semibold text-text-secondary dark:text-text-dark-secondary">
            {t('dashboard.systemAlerts.severityLabel')}
          </label>
          <Select fieldSize="md" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">{t('dashboard.systemAlerts.severityAll')}</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
        <Checkbox
          checked={activeOnly}
          onChange={setActiveOnly}
          label={t('dashboard.systemAlerts.activeOnly')}
        />
      </div>

      {loading && <p>{t('dashboard.systemAlerts.loading')}</p>}
      {error && <p role="alert" className="text-danger">{error}</p>}

      {!loading && alerts.length === 0 && (
        <p className="text-text-muted dark:text-text-dark-muted">
          {activeOnly ? t('dashboard.systemAlerts.emptyActive') : t('dashboard.systemAlerts.empty')}
        </p>
      )}

      <ul className="list-none p-0 grid gap-2">
        {alerts.map((a) => (
          <li
            key={a.id}
            className={`border border-ui-border dark:border-ui-dark-border border-l-4 ${SEVERITY_CLASSES[a.severity] ?? 'border-l-ui-border'} rounded-lg p-3 bg-ui-card dark:bg-ui-dark-card`}
          >
            <div className="flex justify-between gap-4">
              <div>
                <strong>{a.title}</strong>
                <div className="text-sm text-text-muted dark:text-text-dark-muted">
                  {a.rule_slug || t('dashboard.systemAlerts.adHoc')} · {a.source} · {new Date(a.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-1.5">
                {!a.acknowledged_at && (
                  <Button variant="outlineTeal" size="xs" onClick={() => onAcknowledge(a.id)}>
                    {t('dashboard.systemAlerts.acknowledge')}
                  </Button>
                )}
                {!a.resolved_at && (
                  <Button variant="primary" size="xs" onClick={() => onResolve(a.id)}>
                    {t('dashboard.systemAlerts.resolve')}
                  </Button>
                )}
              </div>
            </div>
            {a.context && Object.keys(a.context).length > 0 && (
              <pre className="mt-2 p-2 bg-ui-body dark:bg-ui-dark-bg rounded-md text-sm overflow-auto">
                {JSON.stringify(a.context, null, 2)}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
