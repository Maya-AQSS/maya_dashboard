import { useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { Button, PageTitle } from '@maya/shared-ui-react'
import { useSystemAlerts } from '../hooks/useSystemAlerts'

const SEVERITY_CLASSES = {
  critical: 'border-l-danger',
  high:     'border-l-orange-500',
  medium:   'border-l-warning',
  low:      'border-l-info',
}

export default function SystemAlertsPage() {
  const { token } = useAuth()
  const [severity, setSeverity] = useState('')
  const [activeOnly, setActiveOnly] = useState(true)

  const { alerts, loading, error, onAcknowledge, onResolve } = useSystemAlerts({
    token, activeOnly, severity: severity || undefined,
  })

  return (
    <div className="max-w-[960px] mx-auto p-4">
      <PageTitle
        title="Alertas del sistema"
        subtitle="Eventos derivados de reglas sobre logs o métricas. Reconoce y resuelve para mantener el panel limpio."
      />

      <div className="flex gap-3 mb-4">
        <label>
          Severidad:{' '}
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">Todas</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
          {' '}Solo activas
        </label>
      </div>

      {loading && <p>Cargando…</p>}
      {error && <p role="alert" className="text-danger">{error}</p>}

      {!loading && alerts.length === 0 && (
        <p className="text-text-muted dark:text-text-dark-muted">No hay alertas {activeOnly ? 'activas' : ''}.</p>
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
                  {a.rule_slug || 'ad-hoc'} · {a.source} · {new Date(a.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-1.5">
                {!a.acknowledged_at && (
                  <Button variant="outlineTeal" size="xs" onClick={() => onAcknowledge(a.id)}>Reconocer</Button>
                )}
                {!a.resolved_at && (
                  <Button variant="primary" size="xs" onClick={() => onResolve(a.id)}>Resolver</Button>
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
