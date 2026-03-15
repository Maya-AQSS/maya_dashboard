import { useEffect, useMemo, useState } from 'react'
import useToolsData from '../hooks/useToolsData'
import ToolsGrid from '../components/ToolsGrid'
import ToolsToggleButton from '../components/ToolsToggleButton'
import PageHeader from '../../../shared/components/PageHeader'
import { useLocale } from '../../../shared/i18n'
import { buildVisibleTools, paginate } from '../lib/toolsListView'


const PAGE_SIZE = 8

function ToolsListPage() {
  const { t } = useLocale()
  const { tools, loading, error, toggleFavorite } = useToolsData()
  const [showAll, setShowAll] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)


  useEffect(() => {
    setCurrentPage(1)
  }, [showAll, searchTerm])


  const { pageItems, meta } = useMemo(() => {

    const visible = buildVisibleTools(tools, { showAll, searchTerm })
    return paginate(visible, { pageSize: PAGE_SIZE, currentPage })

  }, [tools, showAll, searchTerm, currentPage])

  const { totalItems, totalPages, startIndex, endIndex, canGoPrev, canGoNext } = meta
  
  const showLastUsed = !showAll

  const handlePrevPage = () => {
    if (canGoPrev) setCurrentPage((page) => page - 1)
  }

  const handleNextPage = () => {
    if (canGoNext) setCurrentPage((page) => page + 1)
  }

  if (loading) return <div className="text-gray-900 dark:text-odoo-dark-text">{t('tools.loading')}</div>
  if (error) return <div className="text-red-600 dark:text-red-400">{t('tools.error')} {error}</div>
  if (!tools || tools.length === 0) return <p className="text-gray-900 dark:text-odoo-dark-text">{t('tools.noTools')}</p>


  return (
    <>
      <PageHeader
        title={showAll ? t('tools.allTools') : t('tools.favoriteTools')}
        subtitle={
          showAll
            ? t('tools.allToolsSubtitle')
            : t('tools.favoriteToolsSubtitle')
        }
        rightAction={
          <ToolsToggleButton
            showAll={showAll}
            onToggle={() => setShowAll((prev) => !prev)}
          />
        }
      />


      <div className="w-full mb-6 sm:mb-8 flex justify-center px-0">
        <div className="relative w-full sm:w-1/2 min-w-0 max-w-[480px]">
          <input
            type="text"
            className="w-full py-2.5 px-4 rounded-full border border-violet-200 dark:border-odoo-dark-border bg-violet-50 dark:bg-odoo-dark-surface text-sm text-gray-900 dark:text-odoo-dark-text outline-none shadow-[0_4px_10px_-6px_rgba(113,75,103,0.4),0_0_0_1px_rgba(148,163,184,0.3)] dark:shadow-none placeholder:text-gray-500 dark:placeholder:text-odoo-dark-muted focus:border-amber-500 dark:focus:border-odoo-primary focus:bg-amber-50 dark:focus:bg-odoo-dark-surface focus:shadow-[0_6px_14px_-8px_rgba(245,158,11,0.6),0_0_0_1px_rgba(245,158,11,0.5)] dark:focus:shadow-none"
            placeholder={t('tools.searchPlaceholderLong')}
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
      </div>


      <ToolsGrid
        tools={pageItems}
        onToggleFavorite={toggleFavorite}
        showLastUsed={showLastUsed}
      />


      {totalItems > PAGE_SIZE && (
        <div className="w-full mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            className="py-1.5 px-3.5 rounded-full border border-amber-400 dark:border-amber-500 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm font-medium cursor-pointer shadow-[0_4px_10px_-6px_rgba(245,158,11,0.4)] dark:shadow-none disabled:opacity-45 disabled:cursor-default disabled:transform-none hover:enabled:bg-amber-200 dark:hover:enabled:bg-amber-800/50 hover:enabled:shadow-[0_6px_14px_-8px_rgba(245,158,11,0.6)]"
            onClick={handlePrevPage}
            disabled={!canGoPrev}
          >
            {t('tools.prev')}
          </button>

          <span className="text-xs sm:text-sm text-gray-600 dark:text-odoo-dark-muted text-center order-last w-full sm:order-none sm:w-auto">
            {t('tools.showing', {
              start: startIndex + 1,
              end: Math.min(endIndex, totalItems),
              total: totalItems,
              current: currentPage,
              totalPages,
            })}
          </span>

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

    </>
  )
}

export default ToolsListPage