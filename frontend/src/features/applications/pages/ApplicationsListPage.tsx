import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerTable } from '@ceedcv-maya/shared-hooks-react'
import { useDebounce } from '../../../hooks/useDebounce'
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
} from '@ceedcv-maya/shared-ui-react'
import { listApplications } from '../api/applicationsApi'
import { useAuth } from '@ceedcv-maya/shared-auth-react'
import { useLocale } from '@ceedcv-maya/shared-i18n-react'
import { useFavoritesContext } from '../../favorites/context/FavoritesContext'

type App = {
  id: string
  name: string
  description: string
  documentationUrl: string
  isFavorite: boolean
}

const FAVORITE_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'yes', label: 'Favoritas' },
  { value: 'no', label: 'No favoritas' },
]

function ApplicationsListPage() {
  const { t } = useLocale()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { add: addFavorite, remove: removeFavorite } = useFavoritesContext()

  const { hiddenIds, toggleHidden } =
    useTablePreferences({ storageKey: 'maya:dashboard:applications-table' })

  const table = useServerTable({
    defaults: { search: '', favorite: '' },
    sortableColumns: ['name', 'description', 'updated_at'],
    storageKey: 'maya:dashboard:applications-table',
    defaultSort: { columnId: 'name', direction: 'asc' },
  })

  const [searchInput, setSearchInput] = useState('')
  const [confirmApp, setConfirmApp] = useState<App | null>(null)

  // Server-side query
  const { data: response, isLoading } = useQuery({
    queryKey: ['applications', user?.sub, table.queryParams],
    queryFn: () => {
      if (!user?.sub) throw new Error('User not authenticated')
      return listApplications(user.sub, {
        page: table.queryParams.page,
        per_page: table.queryParams.per_page,
        search: table.queryParams.search || undefined,
        favorite: (table.queryParams.favorite as 'yes' | 'no') || undefined,
        sort_by: table.queryParams.sort_by,
        sort_dir: table.queryParams.sort_dir,
      })
    },
    enabled: !!user?.sub,
    staleTime: 30_000,
  })

  // Backend data already has isFavorite (mapped via mapApplicationFromApi)
  const apps = response?.data ?? []

  const debouncedSetSearch = useDebounce((value: string) => {
    table.setFilter('search', value || undefined)
  }, 400)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSetSearch(value)
  }

  const handleFavoriteClick = (app: App, e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmApp(app)
  }

  const handleConfirmToggle = async () => {
    if (!confirmApp) return
    setConfirmApp(null)
    if (confirmApp.isFavorite) {
      await removeFavorite(confirmApp.id)
    } else {
      await addFavorite(confirmApp.id)
    }
    queryClient.invalidateQueries({ queryKey: ['applications', user?.sub] })
  }

  const columns: ColumnDef<App>[] = [
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
    ]


  return (
    <>
      <PageTitle title={t('nav.applications')} />

      <div className="space-y-4">
        <DataTable
          columns={columns}
          rows={apps}
          loading={isLoading}
          rowKey={(app) => app.id}
          hiddenColumnIds={hiddenIds}
          onToggleHiddenColumn={toggleHidden}
          sortBy={table.sortBy}
          onSortChange={table.onSortChange}
          pageSize={table.pageSize}
          onPageSizeChange={table.onPageSizeChange}
          defaultView="cards"
          viewStorageKey="maya:dashboard:applications-table"
          emptyMessage={t('applications.noApplications')}
          flipCardRender={(app) => {
            return {
              image: `/applications/${app.name}.png`,
              back: (
                <>
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed">
                    {app.description || t('applications.noDescription') || '—'}
                  </p>
                  {app.documentationUrl && app.documentationUrl !== '#' ? (
                    <p className="mt-3 text-xs text-text-muted dark:text-text-dark-muted break-all">
                      {app.documentationUrl}
                    </p>
                  ) : null}
                </>
              ),
              backAction: (
                <button
                  type="button"
                  onClick={(e) => handleFavoriteClick(app, e)}
                  aria-pressed={app.isFavorite}
                  aria-label={app.isFavorite ? t('applications.removeFromFavorites') : t('applications.addToFavorites')}
                  className={[
                    'inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/40',
                    app.isFavorite
                      ? 'bg-warning-light dark:bg-warning-dark/40 text-warning-dark dark:text-warning border border-warning/40'
                      : 'bg-transparent border border-ui-border dark:border-ui-dark-border text-text-secondary dark:text-text-dark-secondary hover:bg-ui-body dark:hover:bg-ui-dark-bg',
                  ].join(' ')}
                >
                  <span aria-hidden>{app.isFavorite ? FAVORITE_STAR_FILLED_CHAR : FAVORITE_STAR_OUTLINE_CHAR}</span>
                  {app.isFavorite ? t('applications.removeFromFavorites') : t('applications.addToFavorites')}
                </button>
              ),
            }
          }}
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
          filtersActiveCount={table.filtersActiveCount}
          onClearFilters={table.resetFilters}
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
                  value={table.filters.favorite}
                  onChange={(e) => table.setFilter('favorite', e.target.value || undefined)}
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
          currentPage={response?.meta?.current_page ?? table.page}
          totalPages={response?.meta?.last_page ?? 1}
          onChange={table.onPageChange}
          info={
            response?.meta?.from != null && response?.meta?.to != null
              ? `${t('applications.page')} ${response.meta.current_page} ${t('applications.of')} ${response.meta.last_page} — ${response.meta.total} ${t('nav.applications').toLowerCase()}`
              : undefined
          }
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
