import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Badge,
  Button,
  DataTable,
  PageTitle,
  Pagination,
  SearchInput,
  Select,
  useToast,
  type ColumnDef,
} from '@ceedcv-maya/shared-ui-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useNotifications } from '../hooks/useNotifications'
import type { Notification, NotificationListFilters } from '../types/notification'

const PAGE_SIZE = 25

export default function NotificationsPage() {
  const { t } = useLocale()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [sortBy, setSortBy] = useState<NotificationListFilters['sort_by']>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filters: NotificationListFilters = {
    page,
    per_page: PAGE_SIZE,
    search: search || undefined,
    unread_only: unreadOnly || undefined,
    sort_by: sortBy,
    sort_dir: sortDir,
  }

  const { notifications, meta, loading, error, onMarkRead, onMarkAllRead } = useNotifications(filters)

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

  const handleSortChange = (col: string | null) => {
    if (!col) return
    if (col === sortBy) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col as NotificationListFilters['sort_by'])
      setSortDir('desc')
    }
    setPage(1)
  }

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
        id: 'title',
        header: t('notifications.fields.title'),
        cell: (n) => (
          <span className={n.read_at ? 'text-text-secondary dark:text-text-dark-secondary' : 'font-semibold'}>
            {n.title}
          </span>
        ),
        sortable: true,
        alwaysVisible: true,
      },
      {
        id: 'app',
        header: t('notifications.fields.app'),
        cell: (n) => (
          <Badge variant="neutral" size="sm">
            {n.app}
          </Badge>
        ),
        width: '120px',
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
        cell: (n) => new Date(n.created_at).toLocaleString(),
        sortable: true,
        width: '180px',
      },
    ],
    [t],
  )

  const filtersPanel = (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <SearchInput
          value={searchInput}
          onChange={handleSearchChange}
          placeholder={t('notifications.searchPlaceholder')}
        />
      </div>
      <div className="min-w-[160px]">
        <label className="mb-1 block text-xs font-semibold text-text-secondary dark:text-text-dark-secondary">
          {t('notifications.filterLabel')}
        </label>
        <Select
          fieldSize="md"
          value={unreadOnly ? 'unread' : 'all'}
          onChange={(e) => {
            setUnreadOnly(e.target.value === 'unread')
            setPage(1)
          }}
        >
          <option value="all">{t('notifications.filterAll')}</option>
          <option value="unread">{t('notifications.filterUnread')}</option>
        </Select>
      </div>
    </div>
  )

  const unreadCount = notifications.filter((n) => !n.read_at).length

  return (
    <div className="max-w-[960px] mx-auto p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <PageTitle
          title={t('notifications.pageTitle')}
          subtitle={t('notifications.pageSubtitle')}
        />
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={notifications}
        loading={loading}
        rowKey={(n) => n.id}
        sortBy={sortBy ?? null}
        onSortChange={handleSortChange}
        pageSize={PAGE_SIZE}
        onPageSizeChange={() => undefined}
        emptyMessage={t('notifications.empty')}
        filtersPanel={filtersPanel}
        onRowClick={(n) => {
          if (!n.read_at) onMarkRead(n.id).catch(() => undefined)
          navigate(`/notifications/${n.id}`)
        }}
      />

      {meta && meta.last_page > 1 && (
        <Pagination
          currentPage={meta.current_page}
          totalPages={meta.last_page}
          onPageChange={setPage}
          prevLabel={t('pagination.prev')}
          nextLabel={t('pagination.next')}
        />
      )}

      {meta && meta.from != null && meta.to != null && (
        <p className="text-xs text-text-muted dark:text-text-dark-muted text-right">
          {t('notifications.paginationInfo', {
            from: meta.from,
            to: meta.to,
            total: meta.total,
          })}
        </p>
      )}
    </div>
  )
}
