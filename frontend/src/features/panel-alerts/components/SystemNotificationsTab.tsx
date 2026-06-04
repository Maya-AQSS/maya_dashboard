import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  DataTable,
  FilterField,
  formatDateTime,
  Pagination,
  TextInput,
  useTablePreferences,
  useToast,
  type ColumnDef,
} from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useNotificationDefinitions } from '../hooks/useNotificationDefinitions'
import { fireNotificationSample } from '../api/notificationSampleApi'
import type { NotificationDefinition, Severity } from '../types/systemNotification'

const SEVERITY_BADGE: Record<Severity, 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
  info: 'neutral',
}

type Props = {
  canToggle: boolean
}

/**
 * Lists the system notification catalog (event types) and lets an admin
 * enable/disable each one inline. Uses the same unified DataTable + filters +
 * pagination as the alerts tab.
 */
export function SystemNotificationsTab({ canToggle }: Props) {
  const { t, dateLocale } = useLocale()
  const { show: toast } = useToast()
  // Solo tipos "event" (on/off). Los "scheduled" se gestionan en "Reglas programadas".
  const { definitions, loading, error, onToggle, toggling } = useNotificationDefinitions({ category: 'event' })

  const { hiddenIds, toggleHidden, sortBy, setSortBy, pageSize, setPageSize } =
    useTablePreferences({ storageKey: 'maya:dashboard:notification-definitions-table' })

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = definitions
    if (q) {
      list = list.filter((d) =>
        d.label.toLowerCase().includes(q) ||
        d.key.toLowerCase().includes(q) ||
        d.source_app.toLowerCase().includes(q),
      )
    }
    if (sortBy) {
      const dir = sortBy.direction === 'asc' ? 1 : -1
      list = [...list].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortBy.columnId] ?? '')
        const bv = String((b as Record<string, unknown>)[sortBy.columnId] ?? '')
        return av.localeCompare(bv) * dir
      })
    }
    return list
  }, [definitions, search, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const columns: ColumnDef<NotificationDefinition>[] = useMemo(() => {
    const cols: ColumnDef<NotificationDefinition>[] = [
      {
        id: 'label',
        header: t('systemNotifications.fields.label'),
        cell: (d) => (
          <div>
            <span className="font-medium">{d.label}</span>
            <code className="block text-xs font-mono text-text-secondary dark:text-text-dark-secondary">{d.key}</code>
          </div>
        ),
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: 'source_app',
        header: t('systemNotifications.fields.sourceApp'),
        cell: (d) => <Badge variant="neutral" size="sm">{d.source_app}</Badge>,
        width: '160px',
        sortable: true,
      },
      {
        id: 'default_severity',
        header: t('panelAlerts.fields.severity'),
        cell: (d) => (
          <Badge variant={SEVERITY_BADGE[d.default_severity]} size="sm">
            {t(`severity.${d.default_severity}`)}
          </Badge>
        ),
        width: '110px',
      },
      {
        id: 'last_evaluated_at',
        header: t('systemNotifications.fields.lastEvaluatedAt'),
        cell: (d) => (d.last_evaluated_at ? formatDateTime(d.last_evaluated_at, dateLocale) : '—'),
        width: '160px',
      },
      {
        id: 'enabled',
        header: t('systemNotifications.fields.enabled'),
        cell: (d) => (
          <div className="flex items-center justify-end gap-2">
            <Badge variant={d.enabled ? 'success' : 'neutral'} size="sm">
              {d.enabled ? t('systemNotifications.enabled') : t('systemNotifications.disabled')}
            </Badge>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                fireNotificationSample(d.key)
                  .then(() => toast({ tone: 'success', title: t('notifications.testSent') }))
                  .catch(() => toast({ tone: 'danger', title: t('notifications.testError') }))
              }}
            >
              {t('actions.test')}
            </Button>
            {canToggle && (
              <Button
                variant="outline"
                size="xs"
                disabled={toggling}
                onClick={() => {
                  onToggle(d.id, !d.enabled)
                    .then(() => toast({ tone: 'success', title: t('systemNotifications.toggleSuccess') }))
                    .catch(() => toast({ tone: 'danger', title: t('systemNotifications.toggleError') }))
                }}
              >
                {d.enabled ? t('systemNotifications.disable') : t('systemNotifications.enable')}
              </Button>
            )}
          </div>
        ),
        width: '260px',
        align: 'right',
      },
    ]
    return cols
  }, [canToggle, dateLocale, onToggle, t, toast, toggling])

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}

      <DataTable
        columns={columns}
        rows={pageRows}
        loading={loading}
        rowKey={(d) => d.id}
        hiddenColumnIds={hiddenIds}
        onToggleHiddenColumn={toggleHidden}
        sortBy={sortBy}
        onSortChange={setSortBy}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        emptyMessage={t('systemNotifications.empty')}
        filtersActiveCount={search ? 1 : 0}
        onClearFilters={() => { setSearch(''); setPage(1) }}
        filtersPanel={
          <FilterField label={t('systemNotifications.searchLabel')}>
            <TextInput
              fieldSize="sm"
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('systemNotifications.searchPlaceholder')}
            />
          </FilterField>
        }
      />

      <Pagination currentPage={safePage} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
