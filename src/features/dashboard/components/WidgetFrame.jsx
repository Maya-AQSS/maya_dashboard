function WidgetFrame({ title, children, editable, onRemove }) {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-odoo-dark-surface rounded-2xl border border-gray-200 dark:border-odoo-dark-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-odoo-dark-border">
        <span className="text-sm font-semibold text-gray-700 dark:text-odoo-dark-text truncate">
          {title}
        </span>
        {editable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Eliminar widget"
            className="ml-2 shrink-0 text-gray-400 hover:text-red-500 dark:text-odoo-dark-muted dark:hover:text-red-400 transition text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto p-3">
        {children}
      </div>
    </div>
  )
}

export default WidgetFrame
