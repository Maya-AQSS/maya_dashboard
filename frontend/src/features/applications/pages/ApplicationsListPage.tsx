import { useMemo, useRef, useState } from 'react'
import {
  ConfirmDialog,
  DataTable,
  FAVORITE_STAR_FILLED_CHAR,
  FAVORITE_STAR_OUTLINE_CHAR,
  FilterField,
  PageTitle,
  Pagination,
  Select,
  TextInput,
  useTablePreferences,
  type ColumnDef,
} from '@maya/shared-ui-react'
import useApplicationsData from '../hooks/useApplicationsData'
import { useLocale } from '@maya/shared-i18n-react'

type App = {
  id: string
  name: string
  description: string
  documentationUrl: string
  isFavorite: boolean
}

type Filters = {
  search: string
  favorite: '' | 'yes' | 'no'
}

function applyFilters(apps: App[], filters: Filters): App[] {
  return apps.filter((app) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const match =
        app.name?.toLowerCase().includes(q) ||
        app.description?.toLowerCase().includes(q)
      if (!match) return false
    }
    if (filters.favorite === 'yes' && !app.isFavorite) return false
    if (filters.favorite === 'no' && app.isFavorite) return false
    return true
  })
}

const FAVORITE_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'yes', label: 'Favoritas' },
  { value: 'no', label: 'No favoritas' },
]

function ApplicationsListPage() {
  const { t } = useLocale()
  const { apps, loading, error, toggleFavorite } = useApplicationsData()
  const { hiddenIds, toggleHidden, sortBy, setSortBy, pageSize, setPageSize } =
    useTablePreferences({ storageKey: 'maya:dashboard:applications-table' })

  const [filters, setFilters] = useState<Filters>({ search: '', favorite: '' })
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [confirmApp, setConfirmApp] = useState<App | null>(null)

  const filtered = useMemo(() => applyFilters(apps as App[], filters), [apps, filters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageSlice = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const filtersActiveCount = [filters.search, filters.favorite].filter(Boolean).length

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value }))
      setPage(1)
    }, 400)
  }

  const clearFilters = () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    setSearchInput('')
    setFilters({ search: '', favorite: '' })
    setPage(1)
  }

  const handleFilterChange = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }))
    setPage(1)
  }

  const handleFavoriteClick = (app: App, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmApp(app)
  }

  const handleConfirmToggle = () => {
    if (confirmApp) {
      toggleFavorite(confirmApp.id)
      setConfirmApp(null)
    }
  }

  const columns: ColumnDef<App>[] = useMemo(
    () => [
      {
        id: 'name',
        header: t('nav.applications') === 'Aplicaciones' ? 'Nombre' : 'Name',
        cell: (app) => <span className="font-medium">{app.name}</span>,
        sortable: true,
        alwaysVisible: true,
      },
      {
        id: 'description',
        header: 'Descripción',
        cell: (app) => (
          <span className="text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-2">
            {app.description || '—'}
          </span>
        ),
        width: '50%',
      },
      {
        id: 'favorite',
        header: t('applications.favorite'),
        cell: (app) => (
          <button
            type="button"
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ui-dark-card ${
              app.isFavorite
                ? 'bg-warning-light dark:bg-warning-dark/40 text-warning-dark dark:text-warning shadow-sm hover:bg-danger-light/40 dark:hover:bg-danger-dark/25 hover:ring-2 hover:ring-inset hover:ring-danger/30 hover:text-danger-dark dark:hover:text-danger hover:shadow-md focus-visible:ring-danger/50'
                : 'border border-ui-border dark:border-ui-dark-border text-text-secondary dark:text-text-dark-secondary hover:text-warning-dark dark:hover:text-warning hover:border-warning/60 hover:bg-warning-light/50 dark:hover:bg-warning-dark/20 focus-visible:ring-ui-border'
            }`}
            onClick={(e) => handleFavoriteClick(app, e)}
            aria-label={app.isFavorite ? t('applications.removeFromFavorites') : t('applications.addToFavorites')}
            aria-pressed={app.isFavorite}
          >
            {app.isFavorite ? FAVORITE_STAR_FILLED_CHAR : FAVORITE_STAR_OUTLINE_CHAR}
          </button>
        ),
        align: 'center',
        width: '72px',
      },
    ],
    [t],
  )

  if (error) {
    return (
      <>
        <PageTitle title={t('nav.applications')} />
        <div role="alert" className="rounded-lg border border-warning/40 bg-warning-light/40 dark:bg-warning-dark/10 px-4 py-3 text-sm text-warning-dark dark:text-warning-light">
          {error}
        </div>
      </>
    )
  }

  return (
    <>
      <PageTitle title={t('nav.applications')} />

      <div className="space-y-4">
        <DataTable
          columns={columns}
          rows={pageSlice}
          loading={loading && apps.length === 0}
          rowKey={(app) => app.id}
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
          emptyMessage={t('applications.noApplications')}
          cardRender={(app) => (
            <div
              className="flex items-center gap-4 flex-1 cursor-pointer"
              onClick={() => {
                if (app.documentationUrl && app.documentationUrl !== '#') {
                  window.open(app.documentationUrl, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary truncate">
                  {app.name}
                </p>
                {app.description && (
                  <p className="mt-1 text-xs text-text-secondary dark:text-text-dark-secondary line-clamp-2">
                    {app.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-2xl cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-ui-dark-card ${
                  app.isFavorite
                    ? 'bg-warning-light dark:bg-warning-dark/40 text-warning-dark dark:text-warning shadow-sm hover:bg-danger-light/40 dark:hover:bg-danger-dark/25 hover:ring-2 hover:ring-inset hover:ring-danger/30 hover:text-danger-dark dark:hover:text-danger hover:shadow-md focus-visible:ring-danger/50'
                    : 'border-2 border-ui-border dark:border-ui-dark-border text-text-muted dark:text-text-dark-muted hover:text-warning-dark dark:hover:text-warning hover:border-warning/60 hover:bg-warning-light/50 dark:hover:bg-warning-dark/20 focus-visible:ring-ui-border'
                }`}
                onClick={(e) => handleFavoriteClick(app, e)}
                aria-label={app.isFavorite ? t('applications.removeFromFavorites') : t('applications.addToFavorites')}
                aria-pressed={app.isFavorite}
              >
                {app.isFavorite ? FAVORITE_STAR_FILLED_CHAR : FAVORITE_STAR_OUTLINE_CHAR}
              </button>
            </div>
          )}
          filtersActiveCount={filtersActiveCount}
          onClearFilters={clearFilters}
          filtersStorageKey="maya:dashboard:applications-table"
          onRowClick={(app) => {
            if (app.documentationUrl && app.documentationUrl !== '#') {
              window.open(app.documentationUrl, '_blank', 'noopener,noreferrer')
            }
          }}
          filtersPanel={
            <>
              <FilterField label={t('applications.searchPlaceholder')}>
                <TextInput
                  fieldSize="sm"
                  type="search"
                  placeholder={t('applications.searchPlaceholderLong')}
                  value={searchInput}
                  onChange={handleSearchChange}
                />
              </FilterField>
              <FilterField label={t('applications.favorite')}>
                <Select
                  fieldSize="sm"
                  value={filters.favorite}
                  onChange={(e) => handleFilterChange({ favorite: e.target.value as Filters['favorite'] })}
                >
                  {FAVORITE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </FilterField>
            </>
          }
        />

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onChange={setPage}
          info={`${t('applications.page')} ${safePage} ${t('applications.of')} ${totalPages} — ${filtered.length} ${t('nav.applications').toLowerCase()}`}
        />
      </div>

      {confirmApp && (
        <ConfirmDialog
          open
          title={
            confirmApp.isFavorite
              ? t('favorites.removeFromFavoritesTitle', { name: confirmApp.name })
              : t('favorites.addToFavoritesTitle', { name: confirmApp.name })
          }
          description={
            confirmApp.isFavorite
              ? t('favorites.removeFromFavoritesMessage')
              : t('favorites.addToFavoritesMessage')
          }
          confirmLabel={t('actions.confirm')}
          cancelLabel={t('actions.cancel')}
          variant={confirmApp.isFavorite ? 'danger' : 'primary'}
          onConfirm={handleConfirmToggle}
          onCancel={() => setConfirmApp(null)}
        />
      )}
    </>
  )
}

export default ApplicationsListPage
