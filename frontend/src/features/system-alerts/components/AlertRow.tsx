import { useActionState } from 'react'
import { Button } from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'

export interface SystemAlert {
  id: string | number
  title: string
  severity: keyof typeof SEVERITY_CLASSES | string
  rule_slug?: string | null
  source: string
  created_at: string
  acknowledged_at?: string | null
  resolved_at?: string | null
  context?: Record<string, unknown> | null
}

const SEVERITY_CLASSES = {
  critical: 'border-l-danger',
  high: 'border-l-warning-dark',
  medium: 'border-l-warning',
  low: 'border-l-info',
} as const

interface ActionState {
  error: string | null
}

const INITIAL_STATE: ActionState = { error: null }

interface AlertRowProps {
  alert: SystemAlert
  onAcknowledge: (id: string | number) => Promise<unknown>
  onResolve: (id: string | number) => Promise<unknown>
}

/**
 * Row component for SystemAlertsPage. Pilot of React 19 `useActionState`:
 * each action (acknowledge / resolve) carries its own pending + error state,
 * surfaced inline without a global loading flag.
 */
export function AlertRow({ alert, onAcknowledge, onResolve }: AlertRowProps) {
  const { t } = useLocale()

  const [ackState, ackAction, ackPending] = useActionState<ActionState, void>(
    async (_prev) => {
      try {
        await onAcknowledge(alert.id)
        return { error: null }
      } catch (e) {
        return { error: e instanceof Error ? e.message : 'alerts.errorAck' }
      }
    },
    INITIAL_STATE,
  )

  const [resolveState, resolveAction, resolvePending] = useActionState<ActionState, void>(
    async (_prev) => {
      try {
        await onResolve(alert.id)
        return { error: null }
      } catch (e) {
        return { error: e instanceof Error ? e.message : 'alerts.errorResolve' }
      }
    },
    INITIAL_STATE,
  )

  const severityClass = SEVERITY_CLASSES[alert.severity as keyof typeof SEVERITY_CLASSES] ?? 'border-l-ui-border'
  const inlineError = ackState.error ?? resolveState.error

  return (
    <li
      className={`border border-ui-border dark:border-ui-dark-border border-l-4 ${severityClass} rounded-lg p-3 bg-ui-card dark:bg-ui-dark-card`}
    >
      <div className="flex justify-between gap-4">
        <div>
          <strong>{alert.title}</strong>
          <div className="text-sm text-text-muted dark:text-text-dark-muted">
            {alert.rule_slug || t('dashboard.systemAlerts.adHoc')} · {alert.source} ·{' '}
            {new Date(alert.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex gap-1.5">
          {!alert.acknowledged_at && (
            <Button
              variant="outlineTeal"
              size="xs"
              disabled={ackPending}
              onClick={() => ackAction()}
            >
              {ackPending
                ? t('dashboard.systemAlerts.acknowledging')
                : t('dashboard.systemAlerts.acknowledge')}
            </Button>
          )}
          {!alert.resolved_at && (
            <Button
              variant="primary"
              size="xs"
              disabled={resolvePending}
              onClick={() => resolveAction()}
            >
              {resolvePending
                ? t('dashboard.systemAlerts.resolving')
                : t('dashboard.systemAlerts.resolve')}
            </Button>
          )}
        </div>
      </div>
      {inlineError && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {inlineError}
        </p>
      )}
      {alert.context && Object.keys(alert.context).length > 0 && (
        <pre className="mt-2 p-2 bg-ui-body dark:bg-ui-dark-bg rounded-md text-sm overflow-auto">
          {JSON.stringify(alert.context, null, 2)}
        </pre>
      )}
    </li>
  )
}
