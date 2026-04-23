import { useState } from 'react'
import { useAuth } from '@maya/shared-auth-react'
import { useSystemAlerts } from '../hooks/useSystemAlerts'

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high:     '#ea580c',
  medium:   '#ca8a04',
  low:      '#2563eb',
}

export default function SystemAlertsPage() {
  const { token } = useAuth()
  const [severity, setSeverity] = useState('')
  const [activeOnly, setActiveOnly] = useState(true)

  const { alerts, loading, error, onAcknowledge, onResolve } = useSystemAlerts({
    token, activeOnly, severity: severity || undefined,
  })

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600 }}>Alertas del sistema</h1>
      <p style={{ color: 'var(--text-muted, #6b7280)', marginBottom: 16 }}>
        Eventos derivados de reglas sobre logs o métricas. Reconoce y resuelve para mantener el panel limpio.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
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
      {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}

      {!loading && alerts.length === 0 && (
        <p style={{ color: 'var(--text-muted, #6b7280)' }}>No hay alertas {activeOnly ? 'activas' : ''}.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
        {alerts.map((a) => (
          <li key={a.id}
              style={{
                border: '1px solid var(--ui-border, #e5e7eb)', borderLeft: `4px solid ${SEVERITY_COLORS[a.severity]}`,
                borderRadius: 8, padding: 12, background: 'var(--ui-card, #fff)',
              }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <strong>{a.title}</strong>
                <div style={{ fontSize: 12, color: 'var(--text-muted, #6b7280)' }}>
                  {a.rule_slug || 'ad-hoc'} · {a.source} · {new Date(a.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {!a.acknowledged_at && (
                  <button type="button" onClick={() => onAcknowledge(a.id)}>Reconocer</button>
                )}
                {!a.resolved_at && (
                  <button type="button" onClick={() => onResolve(a.id)}>Resolver</button>
                )}
              </div>
            </div>
            {a.context && Object.keys(a.context).length > 0 && (
              <pre style={{ marginTop: 8, padding: 8, background: 'var(--ui-body, #f8fafc)', borderRadius: 6, fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(a.context, null, 2)}
              </pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
