import { useMemo, useCallback } from 'react'
import useToolsData from '../hooks/useToolsData'
import { useToolsListFilters, PAGE_SIZE_OPTIONS } from '../hooks/useToolsListFilters'
import { useDebounce } from '../../../shared/hooks/useDebounce'
import { useIsMobile } from '../../../shared/hooks/useIsMobile'
import ToolsGrid from '../components/ToolsGrid'
import ToolsToggleButton from '../components/ToolsToggleButton'
import PageHeader from '../../../shared/components/PageHeader'
import { useLocale } from '../../../shared/i18n'
import { buildVisibleTools, paginate, getPageNumbersToDisplay } from '../lib/toolsListView'


function ToolsListPage() {
  const { t } = useLocale()
  const { tools, loading, error, toggleFavorite } = useToolsData()
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

  const visibleTools = useMemo(
    () => buildVisibleTools(tools, { showAll, searchTerm: debouncedSearchTerm }),
    [tools, showAll, debouncedSearchTerm],
  )

  const { pageItems: desktopPageItems, meta: desktopMeta } = useMemo(
    () => paginate(visibleTools, { pageSize, currentPage }),
    [visibleTools, pageSize, currentPage],
  )

  const { totalItems, totalPages, currentPage: currentPageSafe, startIndex, endIndex, canGoPrev, canGoNext } = desktopMeta

  const { mobileEndIndex, mobilePageItems } = useMemo(() => {
    const endIdx = Math.min(currentPageSafe * pageSize, totalItems)
    return { mobileEndIndex: endIdx, mobilePageItems: visibleTools.slice(0, endIdx) }
  }, [visibleTools, currentPageSafe, pageSize, totalItems])

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

  if (loading) return <div className="text-text-primary dark:text-text-dark-primary">{t('tools.loading')}</div>
  if (error) return <div className="text-danger dark:text-danger">{error}</div>
  if (!tools || tools.length === 0) return <p className="text-text-primary dark:text-text-dark-primary">{t('tools.noTools')}</p>


  return (
    <>
      <PageHeader
        centerTitleOnMobile
        title={showAll ? t('tools.allTools') : t('tools.favoriteTools')}
        rightAction={
          !isMobile ? (
            <ToolsToggleButton
              showAll={showAll}
              onToggle={handleToggleShowAll}
            />
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
                isMobile ? t('tools.searchPlaceholder') : t('tools.searchPlaceholderLong')
              }
              aria-label={
                isMobile ? t('tools.searchPlaceholder') : t('tools.searchPlaceholderLong')
              }
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent text-text-secondary dark:text-text-dark-secondary cursor-pointer text-lg leading-none hover:text-text-primary dark:hover:text-text-dark-primary"
                onClick={handleClearSearch}
                aria-label={t('tools.clearSearch')}
              >
                ×
              </button>
            )}
          </div>
          <div className="shrink-0 sm:hidden">
            <ToolsToggleButton
              showAll={showAll}
              onToggle={handleToggleShowAll}
            />
          </div>
          <div className="hidden sm:flex items-center min-w-0 shrink-0 ml-auto">
            <label className="flex items-center gap-2.5 text-sm text-text-secondary dark:text-text-dark-secondary shrink-0">
              <span className="whitespace-nowrap">{t('tools.itemsPerPage')}</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="py-2.5 pl-3.5 pr-9 rounded-full border border-odoo-purple/20 dark:border-ui-dark-border bg-odoo-purple/5 dark:bg-ui-dark-card text-text-primary dark:text-text-dark-primary text-sm font-medium outline-none appearance-none cursor-pointer shadow-[0_2px_8px_-4px_rgba(113,75,103,0.2),0_0_0_1px_rgba(148,163,184,0.2)] dark:shadow-none focus:border-warning-dark dark:focus:border-odoo-purple focus:bg-warning-light/30 dark:focus:bg-ui-dark-card focus:shadow-[0_4px_12px_-6px_rgba(245,158,11,0.35),0_0_0_1px_rgba(245,158,11,0.4)] dark:focus:shadow-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")' }}
                aria-label={t('tools.itemsPerPage')}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>


      <div id="tools-results">
        <ToolsGrid
          tools={pageItems}
          onToggleFavorite={toggleFavorite}
        />
      </div>


      {totalItems > 0 && (
        <div className="w-full mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-ui-border-l dark:border-ui-dark-border flex flex-col items-center gap-3">
          {!isMobile && totalItems > pageSize && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                className="py-1.5 px-3.5 rounded-full border border-warning/80 dark:border-warning/60 bg-warning-light dark:bg-warning-dark/40 text-warning-dark dark:text-warning text-sm font-medium cursor-pointer shadow-[0_4px_10px_-6px_rgba(245,158,11,0.4)] dark:shadow-none disabled:opacity-45 disabled:cursor-default disabled:transform-none hover:enabled:bg-warning/20 dark:hover:enabled:bg-warning-dark/60 hover:enabled:shadow-[0_6px_14px_-8px_rgba(245,158,11,0.6)]"
                onClick={handlePrevPage}
                disabled={!canGoPrev}
              >
                {t('tools.prev')}
              </button>

              <nav className="flex items-center gap-1" aria-label={t('tools.paginationLabel')}>
                {pageNumbersToShow.map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 text-text-secondary dark:text-text-dark-secondary text-sm"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCurrentPage(item)}
                      className={`min-w-[2rem] py-1.5 px-2 rounded-full text-sm font-medium cursor-pointer transition ${
                        item === currentPageSafe
                          ? 'border-none bg-odoo-purple text-text-inverse shadow-[0_8px_16px_-10px_rgba(15,23,42,0.3)] dark:shadow-none hover:bg-odoo-purple-d'
                          : 'border border-ui-border dark:border-ui-dark-border bg-ui-card dark:bg-ui-dark-card text-text-primary dark:text-text-dark-primary hover:border-warning-dark dark:hover:border-odoo-purple hover:bg-warning-light/30 dark:hover:bg-ui-dark-card'
                      }`}
                      aria-label={t('tools.pageNumber', { page: item })}
                      aria-current={item === currentPageSafe ? 'page' : undefined}
                    >
                      {item}
                    </button>
                  ),
                )}
              </nav>

              <button
                type="button"
                className="py-1.5 px-3.5 rounded-full border-none bg-odoo-purple text-text-inverse text-sm font-medium cursor-pointer shadow-[0_8px_16px_-10px_rgba(15,23,42,0.3)] dark:shadow-none transition hover:enabled:bg-odoo-purple-d hover:enabled:-translate-y-0.5 disabled:opacity-45 disabled:cursor-default disabled:transform-none"
                onClick={handleNextPage}
                disabled={!canGoNext}
              >
                {t('tools.next')}
              </button>
            </div>
          )}

          {isMobile && canLoadMoreMobile && (
            <button
              type="button"
              className="py-2 px-4 rounded-full border-none bg-odoo-purple text-text-inverse text-sm font-medium cursor-pointer shadow-[0_8px_16px_-10px_rgba(15,23,42,0.3)] dark:shadow-none transition hover:bg-odoo-purple-d"
              onClick={handleLoadMore}
              aria-controls="tools-results"
            >
              {t('tools.loadMore')}
            </button>
          )}

          {isMobile && (
            <span className="sr-only" aria-live="polite">
              {t('tools.showing', {
                start: 1,
                end: mobileEndIndex,
                total: totalItems,
                current: currentPageSafe,
                totalPages,
              })}
            </span>
          )}

          <span className="hidden sm:block text-xs sm:text-sm text-text-secondary dark:text-text-dark-secondary text-center w-full">
            {t('tools.showing', {
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

export default ToolsListPage
