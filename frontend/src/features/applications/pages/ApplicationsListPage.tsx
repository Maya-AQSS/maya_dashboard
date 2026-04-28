import { useMemo, useCallback } from 'react'
import {Button, PageTitle} from '@maya/shared-ui-react'
import useApplicationsData from '../hooks/useApplicationsData'
import { useToolsListFilters, PAGE_SIZE_OPTIONS } from '../../tools/hooks/useToolsListFilters'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { useIsMobile } from '../../../shared/hooks/useIsMobile'
import ApplicationsGrid from '../components/ApplicationsGrid'
import ApplicationsToggleButton from '../components/ApplicationsToggleButton'
import { useLocale } from '../../../shared/i18n'
import { paginate, getPageNumbersToDisplay } from '../../tools/lib/toolsListView'

function buildVisibleApps(apps, { showAll, searchTerm }) {
  let result = showAll ? apps : apps.filter((a) => a.isFavorite)
  if (searchTerm) {
    const q = searchTerm.toLowerCase()
    result = result.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q),
    )
  }
  return result
}

function ApplicationsListPage() {
  const { t } = useLocale()
  const { apps, loading, error, toggleFavorite } = useApplicationsData()
  const { filters, actions } = useToolsListFilters()
  const { showAll, searchTerm, currentPage, pageSize } = filters
  const {
    handleSearchChange,
    handleClearSearch,
    handleToggleShowAll,
    handlePageSizeChange,
    setCurrentPage,
  } = actions

  const isMobile = useIsMobile()
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const visibleApps = useMemo(
    () => buildVisibleApps(apps, { showAll, searchTerm: debouncedSearchTerm }),
    [apps, showAll, debouncedSearchTerm],
  )

  const { pageItems: desktopPageItems, meta: desktopMeta } = useMemo(
    () => paginate(visibleApps, { pageSize, currentPage }),
    [visibleApps, pageSize, currentPage],
  )

  const { totalItems, totalPages, currentPage: currentPageSafe, startIndex, endIndex, canGoPrev, canGoNext } = desktopMeta

  const { mobileEndIndex, mobilePageItems } = useMemo(() => {
    const endIdx = Math.min(currentPageSafe * pageSize, totalItems)
    return { mobileEndIndex: endIdx, mobilePageItems: visibleApps.slice(0, endIdx) }
  }, [visibleApps, currentPageSafe, pageSize, totalItems])

  const pageItems = isMobile ? mobilePageItems : desktopPageItems
  const canLoadMoreMobile = isMobile && mobileEndIndex < totalItems

  const handlePrevPage = useCallback(() => {
    if (canGoPrev) setCurrentPage((page) => page - 1)
  }, [canGoPrev, setCurrentPage])

  const handleNextPage = useCallback(() => {
    if (canGoNext) setCurrentPage((page) => page + 1)
  }, [canGoNext, setCurrentPage])

  const handleLoadMore = useCallback(() => {
    if (canLoadMoreMobile) setCurrentPage((page) => page + 1)
  }, [canLoadMoreMobile, setCurrentPage])

  const pageNumbersToShow = useMemo(
    () => getPageNumbersToDisplay(currentPageSafe, totalPages),
    [currentPageSafe, totalPages],
  )

  if (loading) return <div className="text-text-primary dark:text-text-dark-primary">{t('applications.loading')}</div>
  if (error)
    return (
      <div role="alert" aria-live="assertive" className="text-danger dark:text-danger">
        {error}
      </div>
    )
  if (!apps || apps.length === 0) return <p className="text-text-primary dark:text-text-dark-primary">{t('applications.noApplications')}</p>

  return (
    <>
      <PageTitle
        centerOnMobile
        title={showAll ? t('applications.allApplications') : t('applications.favoriteApplications')}
        actions={
          !isMobile ? (
            <ApplicationsToggleButton showAll={showAll} onToggle={handleToggleShowAll} />
          ) : null
        }
      />

      <div className="w-full mb-6 sm:mb-8 rounded-2xl border border-odoo-purple/10 dark:border-ui-dark-border bg-ui-card/80 dark:bg-ui-dark-card/80 shadow-[0_2px_12px_-4px_rgba(113,75,103,0.12),0_0_0_1px_rgba(148,163,184,0.08)] dark:shadow-none p-4 sm:p-5">
        <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-5">
          <div className="relative flex-1 min-w-0 sm:max-w-[480px]">
            <input
              type="search"
              className="w-full py-2.5 px-4 rounded-full border border-odoo-purple/20 dark:border-ui-dark-border bg-odoo-purple/5 dark:bg-ui-dark-card text-sm text-text-primary dark:text-text-dark-primary outline-none shadow-[0_4px_10px_-6px_rgba(113,75,103,0.4),0_0_0_1px_rgba(148,163,184,0.3)] dark:shadow-none placeholder:text-text-secondary dark:placeholder:text-text-dark-secondary focus:border-warning-dark dark:focus:border-odoo-purple focus:bg-warning-light/30 dark:focus:bg-ui-dark-card focus:shadow-[0_6px_14px_-8px_rgba(245,158,11,0.6),0_0_0_1px_rgba(245,158,11,0.5)] dark:focus:shadow-none"
              placeholder={
                isMobile ? t('applications.searchPlaceholder') : t('applications.searchPlaceholderLong')
              }
              aria-label={
                isMobile ? t('applications.searchPlaceholder') : t('applications.searchPlaceholderLong')
              }
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleClearSearch}
                aria-label={t('applications.clearSearch')}
                className="absolute right-2 top-1/2 -translate-y-1/2 !text-lg leading-none"
              >
                ×
              </Button>
            )}
          </div>
          <div className="shrink-0 sm:hidden">
            <ApplicationsToggleButton showAll={showAll} onToggle={handleToggleShowAll} />
          </div>
          <div className="hidden sm:flex items-center min-w-0 shrink-0 ml-auto">
            <label className="flex items-center gap-2.5 text-sm text-text-secondary dark:text-text-dark-secondary shrink-0">
              <span className="whitespace-nowrap">{t('applications.itemsPerPage')}</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="py-2.5 pl-3.5 pr-9 rounded-full border border-odoo-purple/20 dark:border-ui-dark-border bg-odoo-purple/5 dark:bg-ui-dark-card text-text-primary dark:text-text-dark-primary text-sm font-medium outline-none appearance-none cursor-pointer shadow-[0_2px_8px_-4px_rgba(113,75,103,0.2),0_0_0_1px_rgba(148,163,184,0.2)] dark:shadow-none focus:border-warning-dark dark:focus:border-odoo-purple focus:bg-warning-light/30 dark:focus:bg-ui-dark-card focus:shadow-[0_4px_12px_-6px_rgba(245,158,11,0.35),0_0_0_1px_rgba(245,158,11,0.4)] dark:focus:shadow-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")' }}
                aria-label={t('applications.itemsPerPage')}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div id="applications-results">
        <ApplicationsGrid
          apps={pageItems}
          onToggleFavorite={toggleFavorite}
        />
      </div>

      {totalItems > 0 && (
        <div className="w-full mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-ui-border-l dark:border-ui-dark-border flex flex-col items-center gap-3">
          {!isMobile && totalItems > pageSize && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={!canGoPrev}>
                {t('applications.prev')}
              </Button>

              <nav className="flex items-center gap-1" aria-label={t('applications.paginationLabel')}>
                {pageNumbersToShow.map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-text-secondary dark:text-text-dark-secondary text-sm" aria-hidden="true">…</span>
                  ) : (
                    <Button
                      key={item}
                      variant={item === currentPageSafe ? 'primary' : 'secondary'}
                      size="xs"
                      onClick={() => setCurrentPage(item)}
                      aria-label={t('applications.pageNumber', { page: item })}
                      aria-current={item === currentPageSafe ? 'page' : undefined}
                      className="min-w-[2rem]"
                    >
                      {item}
                    </Button>
                  ),
                )}
              </nav>

              <Button variant="primary" size="sm" onClick={handleNextPage} disabled={!canGoNext}>
                {t('applications.next')}
              </Button>
            </div>
          )}

          {isMobile && canLoadMoreMobile && (
            <Button variant="primary" size="sm" onClick={handleLoadMore} aria-controls="applications-results">
              {t('applications.loadMore')}
            </Button>
          )}

          {isMobile && (
            <span className="sr-only" aria-live="polite">
              {t('applications.showing', { start: 1, end: mobileEndIndex, total: totalItems, current: currentPageSafe, totalPages })}
            </span>
          )}

          <span className="hidden sm:block text-xs sm:text-sm text-text-secondary dark:text-text-dark-secondary text-center w-full">
            {t('applications.showing', {
              start: isMobile ? 1 : startIndex + 1,
              end: isMobile ? mobileEndIndex : Math.min(endIndex, totalItems),
              total: totalItems,
              current: currentPageSafe,
              totalPages,
            })}
          </span>
        </div>
      )}
    </>
  )
}

export default ApplicationsListPage
