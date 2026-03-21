import { useEffect, useMemo, useState } from 'react'
import useToolsData from '../hooks/useToolsData'
import ToolsGrid from '../components/ToolsGrid'
import ToolsToggleButton from '../components/ToolsToggleButton'
import PageHeader from '../../../shared/components/PageHeader'
import { useLocale } from '../../../shared/i18n'
import { buildVisibleTools, paginate, getPageNumbersToDisplay } from '../lib/toolsListView'


const PAGE_SIZE_OPTIONS = [8, 16, 24, 48]
const DEFAULT_PAGE_SIZE = 8

function ToolsListPage() {
  const { t } = useLocale()
  const { tools, loading, error, toggleFavorite } = useToolsData()
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches,
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [showAll, searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mediaQuery = window.matchMedia('(max-width: 639px)')
    const handleChange = (event) => setIsMobile(event.matches)
    handleChange(mediaQuery)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const visibleTools = useMemo(
    () => buildVisibleTools(tools, { showAll, searchTerm }),
    [tools, showAll, searchTerm],
  )

  const { pageItems: desktopPageItems, meta: desktopMeta } = useMemo(
    () => paginate(visibleTools, { pageSize, currentPage }),
    [visibleTools, pageSize, currentPage],
  )

  const { totalItems, totalPages, currentPage: currentPageSafe, startIndex, endIndex, canGoPrev, canGoNext } = desktopMeta
  const mobileEndIndex = Math.min(currentPageSafe * pageSize, totalItems)
  const mobilePageItems = visibleTools.slice(0, mobileEndIndex)
  const pageItems = isMobile ? mobilePageItems : desktopPageItems
  const canLoadMoreMobile = isMobile && mobileEndIndex < totalItems
  
  const showLastUsed = !showAll

  const handlePrevPage = () => {
    if (canGoPrev) setCurrentPage((page) => page - 1)
  }

  const handleNextPage = () => {
    if (canGoNext) setCurrentPage((page) => page + 1)
  }

  const handleLoadMore = () => {
    if (canLoadMoreMobile) setCurrentPage((page) => page + 1)
  }

  const pageNumbersToShow = useMemo(
    () => getPageNumbersToDisplay(currentPageSafe, totalPages),
    [currentPageSafe, totalPages],
  )

  if (loading) return <div className="text-gray-900 dark:text-odoo-dark-text">{t('tools.loading')}</div>
  if (error) return <div className="text-red-600 dark:text-red-400">{t('tools.error')} {error}</div>
  if (!tools || tools.length === 0) return <p className="text-gray-900 dark:text-odoo-dark-text">{t('tools.noTools')}</p>


  return (
    <>
      <PageHeader
        centerTitleOnMobile
        title={showAll ? t('tools.allTools') : t('tools.favoriteTools')}
        rightAction={
          !isMobile ? (
            <ToolsToggleButton
              showAll={showAll}
              onToggle={() => setShowAll((prev) => !prev)}
            />
          ) : null
        }
      />


      <div className="w-full mb-6 sm:mb-8 rounded-2xl border border-violet-100 dark:border-odoo-dark-border bg-white/80 dark:bg-odoo-dark-surface/80 shadow-[0_2px_12px_-4px_rgba(113,75,103,0.12),0_0_0_1px_rgba(148,163,184,0.08)] dark:shadow-none p-4 sm:p-5">
        <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-5">
          <div className="relative flex-1 min-w-0 sm:max-w-[480px]">
            <input
              type="search"
              className="w-full py-2.5 px-4 rounded-full border border-violet-200 dark:border-odoo-dark-border bg-violet-50 dark:bg-odoo-dark-surface text-sm text-gray-900 dark:text-odoo-dark-text outline-none shadow-[0_4px_10px_-6px_rgba(113,75,103,0.4),0_0_0_1px_rgba(148,163,184,0.3)] dark:shadow-none placeholder:text-gray-500 dark:placeholder:text-odoo-dark-muted focus:border-amber-500 dark:focus:border-odoo-primary focus:bg-amber-50 dark:focus:bg-odoo-dark-surface focus:shadow-[0_6px_14px_-8px_rgba(245,158,11,0.6),0_0_0_1px_rgba(245,158,11,0.5)] dark:focus:shadow-none"
              placeholder={
                isMobile ? t('tools.searchPlaceholder') : t('tools.searchPlaceholderLong')
              }
              aria-label={
                isMobile ? t('tools.searchPlaceholder') : t('tools.searchPlaceholderLong')
              }
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent text-gray-500 dark:text-odoo-dark-muted cursor-pointer text-lg leading-none hover:text-gray-900 dark:hover:text-odoo-dark-text"
                onClick={() => setSearchTerm('')}
                aria-label={t('tools.clearSearch')}
              >
                ×
              </button>
            )}
          </div>
          <div className="shrink-0 sm:hidden">
            <ToolsToggleButton
              showAll={showAll}
              onToggle={() => setShowAll((prev) => !prev)}
            />
          </div>
          <div className="hidden sm:flex items-center min-w-0 shrink-0 ml-auto">
            <label className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-odoo-dark-muted shrink-0">
              <span className="whitespace-nowrap">{t('tools.itemsPerPage')}</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="py-2.5 pl-3.5 pr-9 rounded-full border border-violet-200 dark:border-odoo-dark-border bg-violet-50 dark:bg-odoo-dark-surface text-gray-900 dark:text-odoo-dark-text text-sm font-medium outline-none appearance-none cursor-pointer shadow-[0_2px_8px_-4px_rgba(113,75,103,0.2),0_0_0_1px_rgba(148,163,184,0.2)] dark:shadow-none focus:border-amber-500 dark:focus:border-odoo-primary focus:bg-amber-50 dark:focus:bg-odoo-dark-surface focus:shadow-[0_4px_12px_-6px_rgba(245,158,11,0.35),0_0_0_1px_rgba(245,158,11,0.4)] dark:focus:shadow-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat"
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
          showLastUsed={showLastUsed}
        />
      </div>


      {totalItems > 0 && (
        <div className="w-full mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100 dark:border-odoo-dark-border flex flex-col items-center gap-3">
          {!isMobile && totalItems > pageSize && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                className="py-1.5 px-3.5 rounded-full border border-amber-400 dark:border-amber-500 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm font-medium cursor-pointer shadow-[0_4px_10px_-6px_rgba(245,158,11,0.4)] dark:shadow-none disabled:opacity-45 disabled:cursor-default disabled:transform-none hover:enabled:bg-amber-200 dark:hover:enabled:bg-amber-800/50 hover:enabled:shadow-[0_6px_14px_-8px_rgba(245,158,11,0.6)]"
                onClick={handlePrevPage}
                disabled={!canGoPrev}
              >
                {t('tools.prev')}
              </button>

              <nav className="flex items-center gap-1" aria-label={t('tools.paginationLabel')}>
              {pageNumbersToShow.map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-500 dark:text-odoo-dark-muted text-sm" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    className={`min-w-[2rem] py-1.5 px-2 rounded-full text-sm font-medium cursor-pointer transition ${
                      item === currentPageSafe
                        ? 'border-none bg-odoo-primary text-gray-50 shadow-[0_8px_16px_-10px_rgba(15,23,42,0.3)] dark:shadow-none hover:bg-odoo-primary-hover'
                        : 'border border-gray-300 dark:border-odoo-dark-border bg-white dark:bg-odoo-dark-surface text-gray-700 dark:text-odoo-dark-text hover:border-amber-500 dark:hover:border-odoo-primary hover:bg-amber-50 dark:hover:bg-odoo-dark-surface'
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
                className="py-1.5 px-3.5 rounded-full border-none bg-odoo-primary text-gray-50 text-sm font-medium cursor-pointer shadow-[0_8px_16px_-10px_rgba(15,23,42,0.3)] dark:shadow-none transition hover:enabled:bg-odoo-primary-hover hover:enabled:-translate-y-0.5 disabled:opacity-45 disabled:cursor-default disabled:transform-none"
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
              className="py-2 px-4 rounded-full border-none bg-odoo-primary text-gray-50 text-sm font-medium cursor-pointer shadow-[0_8px_16px_-10px_rgba(15,23,42,0.3)] dark:shadow-none transition hover:bg-odoo-primary-hover"
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

          <span className="hidden sm:block text-xs sm:text-sm text-gray-500 dark:text-odoo-dark-muted text-center w-full">
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