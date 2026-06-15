import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { buildBackState, useBackNavigation } from '@ceedcv-maya/shared-hooks-react'
import { useDebounce } from '../../../hooks/useDebounce'
import { EditorContentHtml } from '@ceedcv-maya/shared-editor-react'
import {
  Badge,
  Button,
  DataTable,
  formatDateTime,
  FilterField,
  PageTitle,
  Pagination,
  Select,
  TextInput,
  useTablePreferences,
  useToast,
  type ColumnDef,
} from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useUserProfile } from '../../user-profile'
import { DASHBOARD_PERMISSIONS } from '../../../permissions'
import { usePanelAlerts } from '../hooks/usePanelAlerts'
import { SystemNotificationsTab } from '../components/SystemNotificationsTab'
import { ScheduledRulesTab } from '../components/ScheduledRulesTab'
import type { PanelAlert, PanelAlertFilters, Severity } from '../types/panelAlert'

type Tab = 'alerts' | 'system' | 'rules'

const SEVERITY_BADGE: Record<Severity, 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
  info: 'neutral',
}

export default function PanelAlertsPage() {
  const { t, dateLocale } = useLocale()
  const { show: toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { goBack } = useBackNavigation({ fallback: '/' })
  const { hasPermission } = useUserProfile()
  const [searchParams, setSearchParams] = useSearchParams()

  const canIndexAlerts = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsIndex)
  const canCreateAlert = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsCreate)
  const canUpdateAlert = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsUpdate)
  const canDeleteAlert = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsDelete)

  // ── URL-synced filter state ───────────────────────────────────
  const activeTab = (searchParams.get('tab') as Tab | null) ?? 'alerts'
  const alertPage = Number(searchParams.get('page') ?? '1')
  const alertSearch = searchParams.get('search') ?? ''
  const alertSeverity = (searchParams.get('severity') as Severity | '') ?? ''
  // Por defecto se muestran TODAS las alertas (activas y expiradas), ordenadas
  // por fecha de ejecución/finalización; el usuario puede filtrar a solo activas.
  const includeExpired = searchParams.get('expired') !== '0'

  const [alertSearchInput, setAlertSearchInput] = useState(alertSearch)

  const setActiveTab = (tab: Tab) => {
    setSearchParams((prev) => { prev.set('tab', tab); prev.delete('page'); return prev }, { replace: true })
  }
  const setAlertPage = (page: number) => {
    setSearchParams((prev) => { prev.set('page', String(page)); return prev }, { replace: true })
  }
  const setAlertSeverity = (severity: Severity | '') => {
    setSearchParams((prev) => { severity ? prev.set('severity', severity) : prev.delete('severity'); prev.delete('page'); return prev }, { replace: true })
  }
  const setIncludeExpired = (value: boolean) => {
    // Ausencia de 'expired' = todas (por defecto); 'expired=0' = solo activas.
    setSearchParams((prev) => { value ? prev.delete('expired') : prev.set('expired', '0'); prev.delete('page'); return prev }, { replace: true })
  }

  const { hiddenIds, toggleHidden, sortBy, setSortBy, pageSize, setPageSize } =
    useTablePreferences({ storageKey: 'maya:dashboard:panel-alerts-table' })

  const alertFilters: PanelAlertFilters = {
    page: alertPage,
    per_page: pageSize,
    search: alertSearch || undefined,
    severity: alertSeverity || undefined,
    include_expired: includeExpired || undefined,
    sort_by: (sortBy?.columnId as PanelAlertFilters['sort_by']) ?? 'visible_from',
    sort_dir: sortBy?.direction ?? 'desc',
  }

  const { alerts, meta, loading: alertsLoading, error: alertsError, onDelete } =
    usePanelAlerts(alertFilters, { enabled: canIndexAlerts })

  // ── Alert columns ─────────────────────────────────────────────
  const alertColumns: ColumnDef<PanelAlert>[] = useMemo(
    () => {
      const columns: ColumnDef<PanelAlert>[] = [
      {
        id: 'severity',
        header: t('panelAlerts.fields.severity'),
        cell: (a) => (
          <Badge variant={SEVERITY_BADGE[a.severity]} size="sm">
            {t(`severity.${a.severity}`)}
          </Badge>
        ),
        width: '110px',
        sortable: true,
      },
      {
        id: 'text',
        header: t('panelAlerts.fields.text'),
        cell: (a) => (
          <EditorContentHtml
            html={a.text}
            className="line-clamp-2 text-sm [&_p]:m-0"
          />
        ),
        alwaysVisible: true,
      },
      {
        id: 'visible_from',
        header: t('panelAlerts.fields.visibleFrom'),
        cell: (a) => formatDateTime(a.visible_from, dateLocale),
        sortable: true,
        width: '160px',
      },
      {
        id: 'visible_until',
        header: t('panelAlerts.fields.visibleUntil'),
        cell: (a) => (a.visible_until ? formatDateTime(a.visible_until, dateLocale) : '—'),
        sortable: true,
        width: '160px',
      },
      {
        id: 'schedule_cron',
        header: t('panelAlerts.fields.recurrence'),
        cell: (a) => (a.schedule_cron ? <code className="text-xs font-mono">{a.schedule_cron}</code> : '—'),
        width: '130px',
      },
      {
        id: 'source',
        header: t('panelAlerts.fields.source'),
        cell: (a) => (
          <Badge variant="neutral" size="sm">{t(`panelAlerts.source.${a.source}`)}</Badge>
        ),
        width: '90px',
      },
      ]

      if (canUpdateAlert || canDeleteAlert) {
        columns.push({
          id: 'actions',
          header: '',
          cell: (a) => (
            <div className="flex gap-1">
              {canUpdateAlert && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={(e) => { e.stopPropagation(); navigate(`/panel-alerts/alertas/${a.id}`, { state: { record: a, ...buildBackState(location) } }) }}
                >
                  {t('actions.edit')}
                </Button>
              )}
              {canDeleteAlert && (
                <Button
                  variant="danger"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(t('panelAlerts.confirmDelete'))) {
                      onDelete(a.id).then(() =>
                        toast({ tone: 'success', title: t('panelAlerts.deleteSuccess') }),
                      ).catch(() =>
                        toast({ tone: 'danger', title: t('panelAlerts.deleteError') }),
                      )
                    }
                  }}
                >
                  {t('actions.delete')}
                </Button>
              )}
            </div>
          ),
          width: '120px',
          align: 'right',
        })
      }

      return columns
    },
    [canDeleteAlert, canUpdateAlert, dateLocale, navigate, onDelete, t, toast],
  )

  // ── Handlers ──────────────────────────────────────────────────
  const debouncedAlertSearch = useDebounce((v: string) => {
    setSearchParams((prev) => { v ? prev.set('search', v) : prev.delete('search'); prev.delete('page'); return prev }, { replace: true })
  }, 400)

  const handleAlertSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setAlertSearchInput(v)
    debouncedAlertSearch(v)
  }

  const alertFiltersActive = [alertSearch, alertSeverity, includeExpired ? '' : 'active-only'].filter(Boolean).length
  const visibleTabs: Tab[] = ['alerts', 'system', 'rules']

  const tabLabel = (tab: Tab): string =>
    tab === 'alerts'
      ? t('panelAlerts.tabAlerts')
      : tab === 'system'
        ? t('panelAlerts.tabSystem')
        : t('panelAlerts.tabRules')

  if (!canIndexAlerts) {
    return (
      <>
        <PageTitle title={t('panelAlerts.pageTitle')} onBack={() => goBack()} />
        <p className="text-text-primary dark:text-text-dark-primary" role="status">
          {t('panelAlerts.noPermission')}
        </p>
      </>
    )
  }

  return (
    <>
      <PageTitle
        title={t('panelAlerts.pageTitle')}
        subtitle={t('panelAlerts.pageSubtitle')}
        actions={
          activeTab === 'alerts' && canCreateAlert ? (
            <Button onClick={() => navigate('/panel-alerts/alertas/nueva', { state: buildBackState(location) })}>
              + {t('actions.create')}
            </Button>
          ) : activeTab === 'rules' && canCreateAlert ? (
            <Button onClick={() => navigate('/panel-alerts/reglas/nueva', { state: buildBackState(location) })}>
              + {t('actions.create')}
            </Button>
          ) : undefined
        }
      />

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 border-b border-ui-border dark:border-ui-dark-border">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2',
              activeTab === tab
                ? 'border-brand text-brand dark:text-brand-light'
                : 'border-transparent text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary',
            ].join(' ')}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Alerts tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alertsError && (
            <p role="alert" className="text-sm text-danger">{alertsError}</p>
          )}
          <DataTable
            columns={alertColumns}
            rows={alerts}
            loading={alertsLoading}
            rowKey={(a) => a.id}
            hiddenColumnIds={hiddenIds}
            onToggleHiddenColumn={toggleHidden}
            sortBy={sortBy}
            onSortChange={setSortBy}
            pageSize={pageSize}
            onPageSizeChange={(size) => { setPageSize(size); setAlertPage(1) }}
            emptyMessage={t('panelAlerts.empty')}
            filtersActiveCount={alertFiltersActive}
            onClearFilters={() => {
              setAlertSearchInput('')
              setSearchParams((prev) => { prev.delete('search'); prev.delete('severity'); prev.delete('expired'); prev.delete('page'); return prev }, { replace: true })
            }}
            filtersPanel={
              <>
                <FilterField label={t('panelAlerts.searchLabel')}>
                  <TextInput
                    fieldSize="sm"
                    type="search"
                    value={alertSearchInput}
                    onChange={handleAlertSearch}
                    placeholder={t('panelAlerts.searchPlaceholder')}
                  />
                </FilterField>
                <FilterField label={t('panelAlerts.fields.severity')}>
                  <Select
                    fieldSize="sm"
                    value={alertSeverity}
                    onChange={(e) => { setAlertSeverity(e.target.value as Severity | '') }}
                  >
                    <option value="">{t('panelAlerts.severityAll')}</option>
                    <option value="critical">{t('severity.critical')}</option>
                    <option value="high">{t('severity.high')}</option>
                    <option value="medium">{t('severity.medium')}</option>
                    <option value="low">{t('severity.low')}</option>
                    <option value="info">{t('severity.info')}</option>
                  </Select>
                </FilterField>
                <FilterField label={t('panelAlerts.includeExpired')}>
                  <Select
                    fieldSize="sm"
                    value={includeExpired ? '1' : '0'}
                    onChange={(e) => { setIncludeExpired(e.target.value === '1') }}
                  >
                    <option value="0">{t('panelAlerts.activeOnly')}</option>
                    <option value="1">{t('panelAlerts.allAlerts')}</option>
                  </Select>
                </FilterField>
              </>
            }
          />
          <Pagination
            currentPage={meta?.current_page ?? alertPage}
            totalPages={meta?.last_page ?? 1}
            onChange={setAlertPage}
            info={
              meta?.from != null && meta?.to != null
                ? t('notifications.paginationInfo', { from: meta.from, to: meta.to, total: meta.total })
                : undefined
            }
          />
        </div>
      )}

      {/* System notifications tab */}
      {activeTab === 'system' && (
        <SystemNotificationsTab canToggle={canUpdateAlert} />
      )}

      {/* Scheduled rules tab (level B) */}
      {activeTab === 'rules' && (
        <ScheduledRulesTab canManage={canUpdateAlert} />
      )}
    </>
  )
}
