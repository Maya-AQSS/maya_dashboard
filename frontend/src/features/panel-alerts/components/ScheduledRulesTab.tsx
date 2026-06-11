import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useServerTable } from '@ceedcv-maya/shared-hooks-react'
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
import { listNotificationRules, updateNotificationRule, deleteNotificationRule } from '../api/notificationRulesApi'
import { fireNotificationSample } from '../api/notificationSampleApi'
import type { NotificationRule } from '../types/notificationRule'

type Props = {
  canManage: boolean
}

export function ScheduledRulesTab({ canManage }: Props) {
  const { t } = useLocale()
  const { show: toast } = useToast()
  const navigate = useNavigate()
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { hiddenIds, toggleHidden } =
    useTablePreferences({ storageKey: 'maya:dashboard:notification-rules-table' })

  const table = useServerTable({
    defaults: { search: '' },
    sortableColumns: ['name', 'source_app', 'schedule_cron'],
    storageKey: 'maya:dashboard:notification-rules-table',
    defaultSort: { columnId: 'name', direction: 'asc' },
  })

  const [searchInput, setSearchInput] = useState('')

  const { data: response, isLoading } = useQuery({
    queryKey: ['notification-rules', table.queryParams],
    queryFn: () => listNotificationRules({
      page: table.queryParams.page,
      per_page: table.queryParams.per_page,
      search: table.queryParams.search || undefined,
      sort_by: table.queryParams.sort_by,
      sort_dir: table.queryParams.sort_dir,
    }),
    staleTime: 30_000,
  })

  const rules = response?.data ?? []
  const meta = response?.meta

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      table.setFilter('search', value || undefined)
    }, 400)
  }

  const handleUpdate = async (id: number, data: { enabled: boolean }) => {
    try {
      await updateNotificationRule(id, data)
      toast({ tone: 'success', title: t('systemNotifications.toggleSuccess') })
    } catch {
      toast({ tone: 'danger', title: t('systemNotifications.toggleError') })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteNotificationRule(id)
      toast({ tone: 'success', title: t('scheduledRules.deleteSuccess') })
    } catch {
      toast({ tone: 'danger', title: t('scheduledRules.deleteError') })
    }
  }

  const totalPages = meta?.last_page ?? 1
  const safeCurrentPage = meta?.current_page ?? table.page

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
        sortable: true,
        alwaysVisible: true,
      },
      {
        id: 'source_app',
        header: t('scheduledRules.fields.sourceApp'),
        cell: (r) => <Badge variant="neutral" size="sm">{r.source_app}</Badge>,
        sortable: true,
        width: '150px',
      },
      {
        id: 'schedule_cron',
        header: t('scheduledRules.fields.scheduleCron'),
        cell: (r) => <code className="text-xs font-mono">{r.schedule_cron}</code>,
        sortable: true,
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
                handleUpdate(r.id, { enabled: !r.enabled })
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
                handleDelete(r.id)
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
  }, [canManage, t, navigate, toast])

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={rules}
        loading={isLoading}
        rowKey={(r) => r.id}
        hiddenColumnIds={hiddenIds}
        onToggleHiddenColumn={toggleHidden}
        sortBy={table.sortBy}
        onSortChange={table.onSortChange}
        pageSize={table.pageSize}
        onPageSizeChange={table.onPageSizeChange}
        emptyMessage={t('scheduledRules.empty')}
        filtersActiveCount={table.filtersActiveCount}
        onClearFilters={table.resetFilters}
        filtersPanel={
          <FilterField label={t('scheduledRules.searchLabel')}>
            <TextInput
              fieldSize="sm"
              type="search"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder={t('scheduledRules.searchPlaceholder')}
            />
          </FilterField>
        }
      />

      <Pagination currentPage={safeCurrentPage} totalPages={totalPages} onChange={table.onPageChange} />
    </div>
  )
}
