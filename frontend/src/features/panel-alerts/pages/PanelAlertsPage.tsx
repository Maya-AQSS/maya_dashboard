import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { usePanelAlertRules } from '../hooks/usePanelAlertRules'
import type {
  PanelAlert,
  PanelAlertFilters,
  PanelAlertRule,
  Severity,
} from '../types/panelAlert'

type Tab = 'alerts' | 'rules'

const SEVERITY_BADGE: Record<Severity, 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
}

export default function PanelAlertsPage() {
  const { t, dateLocale } = useLocale()
  const { show: toast } = useToast()
  const navigate = useNavigate()
  const { hasPermission } = useUserProfile()
  const [searchParams, setSearchParams] = useSearchParams()

  const canIndexAlerts = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsIndex)
  const canCreateAlert = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsCreate)
  const canUpdateAlert = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsUpdate)
  const canDeleteAlert = hasPermission(DASHBOARD_PERMISSIONS.panelAlertsDelete)
  const canIndexRules = hasPermission(DASHBOARD_PERMISSIONS.panelAlertRulesIndex)
  const canCreateRule = hasPermission(DASHBOARD_PERMISSIONS.panelAlertRulesCreate)
  const canUpdateRule = hasPermission(DASHBOARD_PERMISSIONS.panelAlertRulesUpdate)
  const canDeleteRule = hasPermission(DASHBOARD_PERMISSIONS.panelAlertRulesDelete)

  // ── URL-synced filter state ───────────────────────────────────
  const activeTab = (searchParams.get('tab') as Tab | null) ?? 'alerts'
  const alertPage = Number(searchParams.get('page') ?? '1')
  const alertSearch = searchParams.get('search') ?? ''
  const alertSeverity = (searchParams.get('severity') as Severity | '') ?? ''
  const includeExpired = searchParams.get('expired') === '1'

  // ── Local UI state (debounce input only) ─────────────────────
  const [alertSearchInput, setAlertSearchInput] = useState(alertSearch)
  const alertDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    setSearchParams((prev) => { value ? prev.set('expired', '1') : prev.delete('expired'); prev.delete('page'); return prev }, { replace: true })
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

  // ── Rules tab state ───────────────────────────────────────────
  const { rules, loading: rulesLoading, error: rulesError, onDelete: onDeleteRule } =
    usePanelAlertRules({ enabled: canIndexRules })

  useEffect(() => {
    if (activeTab === 'rules' && !canIndexRules) {
      setSearchParams((prev) => {
        prev.set('tab', 'alerts')
        prev.delete('page')
        return prev
      }, { replace: true })
    }
  }, [activeTab, canIndexRules, setSearchParams])

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
        width: '160px',
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
                  onClick={(e) => { e.stopPropagation(); navigate(`/panel-alerts/alertas/${a.id}`, { state: { record: a } }) }}
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
    [canDeleteAlert, canUpdateAlert, dateLocale, onDelete, t, toast],
  )

  // ── Rule columns ──────────────────────────────────────────────
  const ruleColumns: ColumnDef<PanelAlertRule>[] = useMemo(
    () => {
      const columns: ColumnDef<PanelAlertRule>[] = [
      {
        id: 'name',
        header: t('panelAlerts.fields.ruleName'),
        cell: (r) => <span className="font-medium">{r.name}</span>,
        alwaysVisible: true,
      },
      {
        id: 'event_type',
        header: t('panelAlerts.fields.eventType'),
        cell: (r) => <code className="text-xs font-mono">{r.event_type}</code>,
        width: '180px',
      },
      {
        id: 'severity',
        header: t('panelAlerts.fields.severity'),
        cell: (r) => (
          <Badge variant={SEVERITY_BADGE[r.severity]} size="sm">
            {t(`severity.${r.severity}`)}
          </Badge>
        ),
        width: '110px',
      },
      {
        id: 'is_active',
        header: t('panelAlerts.fields.isActive'),
        cell: (r) => (
          <Badge variant={r.is_active ? 'success' : 'neutral'} size="sm">
            {r.is_active ? t('panelAlerts.active') : t('panelAlerts.inactive')}
          </Badge>
        ),
        width: '90px',
      },
      {
        id: 'last_triggered_at',
        header: t('panelAlerts.fields.lastTriggeredAt'),
        cell: (r) => (r.last_triggered_at ? formatDateTime(r.last_triggered_at, dateLocale) : '—'),
        width: '160px',
      },
      ]

      if (canUpdateRule || canDeleteRule) {
        columns.push({
          id: 'actions',
          header: '',
          cell: (r) => (
            <div className="flex gap-1">
              {canUpdateRule && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={(e) => { e.stopPropagation(); navigate(`/panel-alerts/reglas/${r.id}`, { state: { record: r } }) }}
                >
                  {t('actions.edit')}
                </Button>
              )}
              {canDeleteRule && (
                <Button
                  variant="danger"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(t('panelAlerts.confirmDelete'))) {
                      onDeleteRule(r.id).then(() =>
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
    [canDeleteRule, canUpdateRule, dateLocale, onDeleteRule, t, toast],
  )

  // ── Handlers ──────────────────────────────────────────────────
  const handleAlertSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setAlertSearchInput(v)
    if (alertDebounceRef.current) clearTimeout(alertDebounceRef.current)
    alertDebounceRef.current = setTimeout(() => {
      setSearchParams((prev) => { v ? prev.set('search', v) : prev.delete('search'); prev.delete('page'); return prev }, { replace: true })
    }, 400)
  }

  const alertFiltersActive = [alertSearch, alertSeverity, includeExpired ? '1' : ''].filter(Boolean).length
  const visibleTabs: Tab[] = canIndexRules ? ['alerts', 'rules'] : ['alerts']
  const canCreateInActiveTab = activeTab === 'alerts' ? canCreateAlert : canCreateRule

  if (!canIndexAlerts) {
    return (
      <>
        <PageTitle title={t('panelAlerts.pageTitle')} onBack={() => navigate('/')} />
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
          canCreateInActiveTab ? (
            <Button
              onClick={() => {
                if (activeTab === 'alerts') navigate('/panel-alerts/alertas/nueva')
                else navigate('/panel-alerts/reglas/nueva')
              }}
            >
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
            {tab === 'alerts' ? t('panelAlerts.tabAlerts') : t('panelAlerts.tabRules')}
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

      {/* Rules tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {rulesError && (
            <p role="alert" className="text-sm text-danger">{rulesError}</p>
          )}
          <DataTable
            columns={ruleColumns}
            rows={rules}
            loading={rulesLoading}
            rowKey={(r) => r.id}
            emptyMessage={t('panelAlerts.rulesEmpty')}
          />
        </div>
      )}

    </>
  )
}
