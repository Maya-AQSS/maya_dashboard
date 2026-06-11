import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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
import { useLocale, useNotificationText } from '@ceedcv-maya/shared-i18n-react'
import { readI18nMeta } from '../notificationI18n'
import { useUserProfile } from '../../user-profile'
import { DASHBOARD_PERMISSIONS } from '../../../permissions'
import { getUnreadCount } from '../api/notificationsApi'
import { useNotifications } from '../hooks/useNotifications'
import { notificationAppLabel } from '../appLabel'
import type { Notification, NotificationListFilters, NotificationSeverity } from '../types/notification'

const POLL_MS = 60_000

const SEVERITY_BADGE: Record<NotificationSeverity, 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
  info: 'neutral',
}

export default function NotificationsPage() {
  const { t, dateLocale } = useLocale()
  const resolveText = useNotificationText()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { hasPermission } = useUserProfile()

  const canIndex = hasPermission(DASHBOARD_PERMISSIONS.notificationsIndex)
  const canUpdate = hasPermission(DASHBOARD_PERMISSIONS.notificationsUpdate)

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { hiddenIds, toggleHidden, sortBy, setSortBy, pageSize, setPageSize } =
    useTablePreferences({ storageKey: 'maya:dashboard:notifications-table' })

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  const filters: NotificationListFilters = {
    page,
    per_page: pageSize,
    search: search || undefined,
    unread_only: unreadOnly || undefined,
    sort_by: (sortBy?.columnId as NotificationListFilters['sort_by']) ?? 'created_at',
    sort_dir: sortBy?.direction ?? 'desc',
  }

  const { notifications, meta, loading, error, onMarkRead, onMarkAllRead, onDelete } = useNotifications(filters, {
    enabled: canIndex,
  })

  const openNotification = (n: Notification) => {
    if (canUpdate && !n.read_at) onMarkRead(n.id).catch(() => undefined)
    // Always open the notification detail; the related resource (n.url) is an
    // explicit "Ver" action inside the detail.
    navigate(`/notifications/${n.id}`)
  }

  const handleDelete = (n: Notification) => {
    if (!window.confirm(t('notifications.confirmDelete'))) return
    onDelete(n.id)
      .then(() => toast({ tone: 'success', title: t('notifications.deleteSuccess') }))
      .catch(() => toast({ tone: 'danger', title: t('notifications.deleteError') }))
  }

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    enabled: canIndex,
    refetchInterval: canIndex ? POLL_MS : false,
    staleTime: 30_000,
  })
  const unreadCount = unreadData?.unread ?? 0

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 400)
  }

  const handleMarkAllRead = async () => {
    try {
      await onMarkAllRead()
      toast({ tone: 'success', title: t('notifications.markAllReadSuccess') })
    } catch {
      toast({ tone: 'danger', title: t('notifications.markAllReadError') })
    }
  }

  const clearFilters = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    setSearchInput('')
    setSearch('')
    setUnreadOnly(false)
    setPage(1)
  }

  const filtersActiveCount = [search, unreadOnly ? 'unread' : ''].filter(Boolean).length

  const columns: ColumnDef<Notification>[] = useMemo(
    () => [
      {
        id: 'read_at',
        header: '',
        cell: (n) =>
          n.read_at ? null : (
            <span className="w-2 h-2 rounded-full bg-info block" title={t('notifications.unread')} />
          ),
        width: '32px',
        align: 'center',
      },
      {
        id: 'severity',
        header: t('notifications.fields.severity'),
        cell: (n) => (
          <Badge variant={SEVERITY_BADGE[n.severity]} size="sm">
            {t(`severity.${n.severity}`)}
          </Badge>
        ),
        width: '110px',
      },
      {
        id: 'title',
        header: t('notifications.fields.title'),
        cell: (n) => (
          <EditorContentHtml
            html={resolveText({
              key: n.title_key,
              fallback: n.title,
              params: n.params,
              localized: readI18nMeta(n.metadata).title,
              localizedDefault: readI18nMeta(n.metadata).default,
            })}
            className={`line-clamp-2 text-sm [&_p]:m-0 ${
              n.read_at
                ? 'text-text-secondary dark:text-text-dark-secondary'
                : 'font-semibold text-text-primary dark:text-text-dark-primary'
            }`}
          />
        ),
        alwaysVisible: true,
      },
      {
        id: 'app',
        header: t('notifications.fields.app'),
        cell: (n) => (
          <Badge variant="neutral" size="sm">
            {notificationAppLabel(t, n.app)}
          </Badge>
        ),
        width: '140px',
      },
      {
        id: 'type',
        header: t('notifications.fields.type'),
        cell: (n) => (
          <code className="text-xs font-mono text-text-secondary dark:text-text-dark-secondary">
            {n.type}
          </code>
        ),
        width: '180px',
      },
      {
        id: 'created_at',
        header: t('notifications.fields.createdAt'),
        cell: (n) => formatDateTime(n.created_at, dateLocale),
        sortable: true,
        width: '180px',
      },
      {
        id: 'read_at',
        header: t('notifications.fields.readAt'),
        cell: (n) => (n.read_at ? formatDateTime(n.read_at, dateLocale) : '—'),
        sortable: true,
        width: '180px',
      },
      {
        id: 'actions',
        header: '',
        cell: (n) => (
          <Button
            variant="danger"
            size="xs"
            onClick={(e) => { e.stopPropagation(); handleDelete(n) }}
          >
            {t('actions.delete')}
          </Button>
        ),
        width: '90px',
        align: 'right',
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dateLocale, t, resolveText],
  )

  const totalPages = meta?.last_page ?? 1
  const safeCurrentPage = meta?.current_page ?? page

  if (!canIndex) {
    return (
      <>
        <PageTitle title={t('notifications.pageTitle')} />
        <p className="text-text-primary dark:text-text-dark-primary" role="status">
          {t('notifications.noPermission')}
        </p>
      </>
    )
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <PageTitle
          title={t('notifications.pageTitle')}
          subtitle={t('notifications.pageSubtitle')}
        />
        {unreadCount > 0 && canUpdate && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <DataTable
          columns={columns}
          rows={notifications}
          loading={loading}
          rowKey={(n) => n.id}
          hiddenColumnIds={hiddenIds}
          onToggleHiddenColumn={toggleHidden}
          sortBy={sortBy}
          onSortChange={setSortBy}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          defaultView="cards"
          viewStorageKey="maya:dashboard:notifications-table"
          emptyMessage={t('notifications.empty')}
          filtersActiveCount={filtersActiveCount}
          onClearFilters={clearFilters}
          filtersStorageKey="maya:dashboard:notifications-table"
          onRowClick={(n) => openNotification(n)}
          cardRender={(n) => (
            <div className="flex items-start gap-3 flex-1">
              <span
                className={`mt-1.5 w-2 h-2 shrink-0 rounded-full ${n.read_at ? 'opacity-0' : 'bg-info'}`}
                aria-hidden
              />
              <div className="flex-1 min-w-0">
                <EditorContentHtml
                  html={resolveText({
                    key: n.title_key,
                    fallback: n.title,
                    params: n.params,
                    localized: readI18nMeta(n.metadata).title,
                    localizedDefault: readI18nMeta(n.metadata).default,
                  })}
                  className={`text-sm truncate line-clamp-1 [&_p]:inline [&_p]:m-0 ${
                    n.read_at
                      ? 'text-text-secondary dark:text-text-dark-secondary'
                      : 'font-semibold text-text-primary dark:text-text-dark-primary'
                  }`}
                />
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="neutral" size="sm">{notificationAppLabel(t, n.app)}</Badge>
                  <span className="text-xs text-text-muted dark:text-text-dark-muted truncate">{n.type}</span>
                </div>
                <p className="text-xs text-text-muted dark:text-text-dark-muted mt-1">
                  {formatDateTime(n.created_at, dateLocale)}
                </p>
              </div>
            </div>
          )}
          flipCardRender={(n) => ({
            back: n.body_key || n.body || readI18nMeta(n.metadata).body ? (
              <EditorContentHtml
                html={resolveText({
                  key: n.body_key,
                  fallback: n.body ?? '',
                  params: n.params,
                  localized: readI18nMeta(n.metadata).body,
                  localizedDefault: readI18nMeta(n.metadata).default,
                })}
                className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed line-clamp-4 [&_p]:m-0"
              />
            ) : (
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">—</p>
            ),
            backAction: canUpdate && !n.read_at ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkRead(n.id).catch(() => undefined)
                }}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium transition bg-transparent border border-ui-border dark:border-ui-dark-border text-text-secondary dark:text-text-dark-secondary hover:bg-ui-body dark:hover:bg-ui-dark-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/40"
              >
                {t('notifications.markRead')}
              </button>
            ) : undefined,
          })}
          filtersPanel={
            <>
              <FilterField label={t('notifications.searchPlaceholder')}>
                <TextInput
                  fieldSize="sm"
                  type="search"
                  placeholder={t('notifications.searchPlaceholder')}
                  value={searchInput}
                  onChange={handleSearchChange}
                />
              </FilterField>
              <FilterField label={t('notifications.filterLabel')}>
                <Select
                  fieldSize="sm"
                  value={unreadOnly ? 'unread' : 'all'}
                  onChange={(e) => {
                    setUnreadOnly(e.target.value === 'unread')
                    setPage(1)
                  }}
                >
                  <option value="all">{t('notifications.filterAll')}</option>
                  <option value="unread">{t('notifications.filterUnread')}</option>
                </Select>
              </FilterField>
            </>
          }
        />

        <Pagination
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          onChange={setPage}
          info={
            meta?.from != null && meta?.to != null
              ? t('notifications.paginationInfo', { from: meta.from, to: meta.to, total: meta.total })
              : undefined
          }
        />
      </div>
    </>
  )
}
