import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Badge,
  Button,
  DataTable,
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
import { usePanelAlerts } from '../hooks/usePanelAlerts'
import { usePanelAlertRules } from '../hooks/usePanelAlertRules'
import { PanelAlertForm } from '../components/PanelAlertForm'
import { PanelAlertRuleForm } from '../components/PanelAlertRuleForm'
import type {
  CreatePanelAlertInput,
  CreatePanelAlertRuleInput,
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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-alert-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl bg-ui-card dark:bg-ui-dark-card border border-ui-border dark:border-ui-dark-border shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 id="panel-alert-modal-title" className="text-base font-semibold text-text-primary dark:text-text-dark-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary dark:text-text-dark-muted dark:hover:text-text-dark-primary text-xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function PanelAlertsPage() {
  const { t } = useLocale()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

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

  const { alerts, meta, loading: alertsLoading, error: alertsError, onCreate, onUpdate, onDelete } =
    usePanelAlerts(alertFilters)

  const [editAlert, setEditAlert] = useState<PanelAlert | null>(null)
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [alertFormLoading, setAlertFormLoading] = useState(false)

  // ── Rules tab state ───────────────────────────────────────────
  const { rules, loading: rulesLoading, error: rulesError, onCreate: onCreateRule, onUpdate: onUpdateRule, onDelete: onDeleteRule } =
    usePanelAlertRules()

  const [editRule, setEditRule] = useState<PanelAlertRule | null>(null)
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [ruleFormLoading, setRuleFormLoading] = useState(false)

  // ── Alert columns ─────────────────────────────────────────────
  const alertColumns: ColumnDef<PanelAlert>[] = useMemo(
    () => [
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
        cell: (a) => <span className="line-clamp-2 text-sm">{a.text}</span>,
        alwaysVisible: true,
      },
      {
        id: 'visible_from',
        header: t('panelAlerts.fields.visibleFrom'),
        cell: (a) => new Date(a.visible_from).toLocaleString(),
        sortable: true,
        width: '160px',
      },
      {
        id: 'visible_until',
        header: t('panelAlerts.fields.visibleUntil'),
        cell: (a) => a.visible_until ? new Date(a.visible_until).toLocaleString() : '—',
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
      {
        id: 'actions',
        header: '',
        cell: (a) => (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => { e.stopPropagation(); setEditAlert(a); setShowAlertForm(true) }}
            >
              {t('actions.edit')}
            </Button>
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
          </div>
        ),
        width: '120px',
        align: 'right',
      },
    ],
    [t, onDelete, toast],
  )

  // ── Rule columns ──────────────────────────────────────────────
  const ruleColumns: ColumnDef<PanelAlertRule>[] = useMemo(
    () => [
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
        cell: (r) => r.last_triggered_at ? new Date(r.last_triggered_at).toLocaleString() : '—',
        width: '160px',
      },
      {
        id: 'actions',
        header: '',
        cell: (r) => (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => { e.stopPropagation(); setEditRule(r); setShowRuleForm(true) }}
            >
              {t('actions.edit')}
            </Button>
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
          </div>
        ),
        width: '120px',
        align: 'right',
      },
    ],
    [t, onDeleteRule, toast],
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

  const handleAlertSubmit = async (data: CreatePanelAlertInput) => {
    setAlertFormLoading(true)
    try {
      if (editAlert) {
        await onUpdate({ id: editAlert.id, data })
        toast({ tone: 'success', title: t('panelAlerts.updateSuccess') })
      } else {
        await onCreate(data)
        toast({ tone: 'success', title: t('panelAlerts.createSuccess') })
      }
      setShowAlertForm(false)
      setEditAlert(null)
    } finally {
      setAlertFormLoading(false)
    }
  }

  const handleRuleSubmit = async (data: CreatePanelAlertRuleInput) => {
    setRuleFormLoading(true)
    try {
      if (editRule) {
        await onUpdateRule({ id: editRule.id, data })
        toast({ tone: 'success', title: t('panelAlerts.updateSuccess') })
      } else {
        await onCreateRule(data)
        toast({ tone: 'success', title: t('panelAlerts.createSuccess') })
      }
      setShowRuleForm(false)
      setEditRule(null)
    } finally {
      setRuleFormLoading(false)
    }
  }

  const alertFiltersActive = [alertSearch, alertSeverity, includeExpired ? '1' : ''].filter(Boolean).length

  return (
    <>
      <PageTitle
        title={t('panelAlerts.pageTitle')}
        subtitle={t('panelAlerts.pageSubtitle')}
        actions={
          <Button
            onClick={() => {
              if (activeTab === 'alerts') { setEditAlert(null); setShowAlertForm(true) }
              else { setEditRule(null); setShowRuleForm(true) }
            }}
          >
            + {t('actions.create')}
          </Button>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-1 mb-4 border-b border-ui-border dark:border-ui-dark-border">
        {(['alerts', 'rules'] as Tab[]).map((tab) => (
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

      {/* Alert form modal */}
      {showAlertForm && (
        <Modal
          title={editAlert ? t('panelAlerts.editAlert') : t('panelAlerts.newAlert')}
          onClose={() => { setShowAlertForm(false); setEditAlert(null) }}
        >
          <PanelAlertForm
            initial={editAlert}
            onSubmit={handleAlertSubmit}
            onCancel={() => { setShowAlertForm(false); setEditAlert(null) }}
            loading={alertFormLoading}
          />
        </Modal>
      )}

      {/* Rule form modal */}
      {showRuleForm && (
        <Modal
          title={editRule ? t('panelAlerts.editRule') : t('panelAlerts.newRule')}
          onClose={() => { setShowRuleForm(false); setEditRule(null) }}
        >
          <PanelAlertRuleForm
            initial={editRule}
            onSubmit={handleRuleSubmit}
            onCancel={() => { setShowRuleForm(false); setEditRule(null) }}
            loading={ruleFormLoading}
          />
        </Modal>
      )}
    </>
  )
}
