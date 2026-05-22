import { useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { Checkbox, PageTitle, Select } from '@maya/shared-ui-react'
import { useLocale } from '@maya/shared-i18n-react'
import { useSystemAlerts } from '../hooks/useSystemAlerts'
import { AlertRow, type SystemAlert } from '../components/AlertRow'

export default function SystemAlertsPage() {
  const { token } = useAuth()
  const { t } = useLocale()
  const [severity, setSeverity] = useState('')
  const [activeOnly, setActiveOnly] = useState(true)

  const { alerts, loading, error, onAcknowledge, onResolve } = useSystemAlerts({
    token: token ?? undefined,
    activeOnly,
    severity: severity || undefined,
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
            {t('filters.severityLabel')}
          </label>
          <Select fieldSize="md" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">{t('dashboard.systemAlerts.severityAll')}</option>
            <option value="critical">{t('severity.critical')}</option>
            <option value="high">{t('severity.high')}</option>
            <option value="medium">{t('severity.medium')}</option>
            <option value="low">{t('severity.low')}</option>
          </Select>
        </div>
        <Checkbox
          checked={activeOnly}
          onChange={setActiveOnly}
          label={t('dashboard.systemAlerts.activeOnly')}
        />
      </div>

      {loading && <p>{t('status.loading')}</p>}
      {error && <p role="alert" className="text-danger">{error}</p>}

      {!loading && alerts.length === 0 && (
        <p className="text-text-muted dark:text-text-dark-muted">
          {activeOnly ? t('dashboard.systemAlerts.emptyActive') : t('dashboard.systemAlerts.empty')}
        </p>
      )}

      <ul className="list-none p-0 grid gap-2">
        {(alerts as SystemAlert[]).map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            onAcknowledge={onAcknowledge}
            onResolve={onResolve}
          />
        ))}
      </ul>
    </div>
  )
}
