import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Badge,
  Button,
  DataTable,
  FilterField,
  Pagination,
  TextInput,
  useTablePreferences,
  useToast,
  type ColumnDef,
} from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useNotificationRules } from '../hooks/useNotificationRules'
import { fireNotificationSample } from '../api/notificationSampleApi'
import type { NotificationRule } from '../types/notificationRule'

type Props = {
  canManage: boolean
}

export function ScheduledRulesTab({ canManage }: Props) {
  const { t } = useLocale()
  const { show: toast } = useToast()
  const navigate = useNavigate()
  const { rules, loading, error, onUpdate, onDelete } = useNotificationRules()

  const { hiddenIds, toggleHidden, sortBy, setSortBy, pageSize, setPageSize } =
    useTablePreferences({ storageKey: 'maya:dashboard:notification-rules-table' })

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = rules
    if (q) {
      list = list.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.evaluator_key.toLowerCase().includes(q) ||
        r.source_app.toLowerCase().includes(q),
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
  }, [rules, search, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const columns: ColumnDef<NotificationRule>[] = useMemo(() => {
    const cols: ColumnDef<NotificationRule>[] = [
      {
        id: 'name',
        header: t('scheduledRules.fields.name'),
        cell: (r) => (
          <div>
            <span className="font-medium">{r.name}</span>
            <code className="block text-xs font-mono text-text-secondary dark:text-text-dark-secondary">{r.evaluator_key}</code>
          </div>
        ),
        alwaysVisible: true,
        sortable: true,
      },
      {
        id: 'source_app',
        header: t('scheduledRules.fields.sourceApp'),
        cell: (r) => <Badge variant="neutral" size="sm">{r.source_app}</Badge>,
        width: '150px',
        sortable: true,
      },
      {
        id: 'schedule_cron',
        header: t('scheduledRules.fields.scheduleCron'),
        cell: (r) => <code className="text-xs font-mono">{r.schedule_cron}</code>,
        width: '130px',
      },
      {
        id: 'params',
        header: t('scheduledRules.fields.params'),
        cell: (r) => <code className="text-xs">{JSON.stringify(r.params)}</code>,
      },
      {
        id: 'enabled',
        header: t('scheduledRules.fields.enabled'),
        cell: (r) => (
          <Badge variant={r.enabled ? 'success' : 'neutral'} size="sm">
            {r.enabled ? t('systemNotifications.enabled') : t('systemNotifications.disabled')}
          </Badge>
        ),
        width: '90px',
      },
    ]

    if (canManage) {
      cols.push({
        id: 'actions',
        header: '',
        cell: (r) => (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                fireNotificationSample(r.evaluator_key)
                  .then(() => toast({ tone: 'success', title: t('notifications.testSent') }))
                  .catch(() => toast({ tone: 'danger', title: t('notifications.testError') }))
              }}
            >
              {t('actions.test')}
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => { e.stopPropagation(); navigate(`/panel-alerts/reglas/${r.id}`, { state: { record: r } }) }}
            >
              {t('actions.edit')}
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                onUpdate({ id: r.id, data: { enabled: !r.enabled } })
                  .then(() => toast({ tone: 'success', title: t('systemNotifications.toggleSuccess') }))
                  .catch(() => toast({ tone: 'danger', title: t('systemNotifications.toggleError') }))
              }}
            >
              {r.enabled ? t('systemNotifications.disable') : t('systemNotifications.enable')}
            </Button>
            <Button
              variant="danger"
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                if (!window.confirm(t('scheduledRules.confirmDelete'))) return
                onDelete(r.id)
                  .then(() => toast({ tone: 'success', title: t('scheduledRules.deleteSuccess') }))
                  .catch(() => toast({ tone: 'danger', title: t('scheduledRules.deleteError') }))
              }}
            >
              {t('actions.delete')}
            </Button>
          </div>
        ),
        width: '300px',
        align: 'right',
      })
    }

    return cols
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage, t, navigate, onUpdate, onDelete, toast])

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}

      <DataTable
        columns={columns}
        rows={pageRows}
        loading={loading}
        rowKey={(r) => r.id}
        hiddenColumnIds={hiddenIds}
        onToggleHiddenColumn={toggleHidden}
        sortBy={sortBy}
        onSortChange={setSortBy}
        pageSize={pageSize}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        emptyMessage={t('scheduledRules.empty')}
        filtersActiveCount={search ? 1 : 0}
        onClearFilters={() => { setSearch(''); setPage(1) }}
        filtersPanel={
          <FilterField label={t('scheduledRules.searchLabel')}>
            <TextInput
              fieldSize="sm"
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('scheduledRules.searchPlaceholder')}
            />
          </FilterField>
        }
      />

      <Pagination currentPage={safePage} totalPages={totalPages} onChange={setPage} />
    </div>
  )
}
