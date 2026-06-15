import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerTable } from '@ceedcv-maya/shared-hooks-react'
import { useDebounce } from '../../../hooks/useDebounce'
import {
  Badge,
  Button,
  DataTable,
  FilterField,
  formatDateTime,
  Pagination,
  Select,
  TextInput,
  useTablePreferences,
  useToast,
  type ColumnDef,
} from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { listNotificationDefinitions, setNotificationDefinitionEnabled } from '../api/notificationDefinitionsApi'
import { fireNotificationSample } from '../api/notificationSampleApi'
import type { NotificationDefinition, Severity, DefinitionCategory } from '../types/systemNotification'

const SEVERITY_BADGE: Record<Severity, 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
  info: 'neutral',
}

// Apps del ecosistema Maya que pueden emitir notificaciones (source_app).
const SOURCE_APP_OPTIONS = [
  'maya-authorization',
  'maya-audit',
  'maya-dms',
  'maya-logs',
  'maya-dashboard',
] as const

const SEVERITY_OPTIONS: Severity[] = ['critical', 'high', 'medium', 'low', 'info']

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
  const queryClient = useQueryClient()

  const { hiddenIds, toggleHidden } =
    useTablePreferences({ storageKey: 'maya:dashboard:notification-definitions-table' })

  const table = useServerTable({
    defaults: { search: '', source_app: '', default_severity: '' },
    sortableColumns: ['label', 'source_app', 'default_severity', 'last_evaluated_at'],
    storageKey: 'maya:dashboard:notification-definitions-table',
    defaultSort: { columnId: 'label', direction: 'asc' },
  })

  const [searchInput, setSearchInput] = useState('')
  const [toggling, setToggling] = useState(false)

  const { data: response, isLoading } = useQuery({
    queryKey: ['notification-definitions', 'event', table.queryParams],
    queryFn: () => listNotificationDefinitions({
      category: 'event' as DefinitionCategory,
      source_app: table.queryParams.source_app || undefined,
      default_severity: table.queryParams.default_severity || undefined,
      page: table.queryParams.page,
      per_page: table.queryParams.per_page,
      search: table.queryParams.search || undefined,
      sort_by: table.queryParams.sort_by,
      sort_dir: table.queryParams.sort_dir,
    }),
    staleTime: 30_000,
  })

  const definitions = response?.data ?? []
  const meta = response?.meta

  const handleToggle = async (id: number, enabled: boolean) => {
    setToggling(true)
    try {
      await setNotificationDefinitionEnabled(id, !enabled)
      // Refresca el catálogo para que el badge refleje el nuevo estado sin recargar.
      await queryClient.invalidateQueries({ queryKey: ['notification-definitions'] })
      toast({ tone: 'success', title: t('systemNotifications.toggleSuccess') })
    } catch {
      toast({ tone: 'danger', title: t('systemNotifications.toggleError') })
    } finally {
      setToggling(false)
    }
  }

  const debouncedSetSearch = useDebounce((value: string) => {
    table.setFilter('search', value || undefined)
  }, 400)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSetSearch(value)
  }

  const totalPages = meta?.last_page ?? 1
  const safeCurrentPage = meta?.current_page ?? table.page

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
        sortable: true,
        alwaysVisible: true,
      },
      {
        id: 'source_app',
        header: t('systemNotifications.fields.sourceApp'),
        cell: (d) => <Badge variant="neutral" size="sm">{d.source_app}</Badge>,
        sortable: true,
        width: '160px',
      },
      {
        id: 'default_severity',
        header: t('panelAlerts.fields.severity'),
        cell: (d) => (
          <Badge variant={SEVERITY_BADGE[d.default_severity]} size="sm">
            {t(`severity.${d.default_severity}`)}
          </Badge>
        ),
        sortable: true,
        width: '110px',
      },
      {
        id: 'last_evaluated_at',
        header: t('systemNotifications.fields.lastEvaluatedAt'),
        cell: (d) => (d.last_evaluated_at ? formatDateTime(d.last_evaluated_at, dateLocale) : '—'),
        sortable: true,
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
                  handleToggle(d.id, d.enabled)
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
  }, [canToggle, dateLocale, t, toast, toggling])

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={definitions}
        loading={isLoading}
        rowKey={(d) => d.id}
        hiddenColumnIds={hiddenIds}
        onToggleHiddenColumn={toggleHidden}
        sortBy={table.sortBy}
        onSortChange={table.onSortChange}
        pageSize={table.pageSize}
        onPageSizeChange={table.onPageSizeChange}
        emptyMessage={t('systemNotifications.empty')}
        filtersActiveCount={table.filtersActiveCount}
        onClearFilters={table.resetFilters}
        filtersPanel={
          <>
            <FilterField label={t('systemNotifications.searchLabel')}>
              <TextInput
                fieldSize="sm"
                type="search"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder={t('systemNotifications.searchPlaceholder')}
              />
            </FilterField>
            <FilterField label={t('panelAlerts.fields.sourceApp')}>
              <Select
                fieldSize="sm"
                value={table.queryParams.source_app ?? ''}
                onChange={(e) => { table.setFilter('source_app', e.target.value || undefined) }}
              >
                <option value="">{t('panelAlerts.sourceAppAll')}</option>
                {SOURCE_APP_OPTIONS.map((app) => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </Select>
            </FilterField>
            <FilterField label={t('panelAlerts.fields.severity')}>
              <Select
                fieldSize="sm"
                value={table.queryParams.default_severity ?? ''}
                onChange={(e) => { table.setFilter('default_severity', e.target.value || undefined) }}
              >
                <option value="">{t('panelAlerts.severityAll')}</option>
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>{t(`severity.${s}`)}</option>
                ))}
              </Select>
            </FilterField>
          </>
        }
      />

      <Pagination currentPage={safeCurrentPage} totalPages={totalPages} onChange={table.onPageChange} />
    </div>
  )
}
