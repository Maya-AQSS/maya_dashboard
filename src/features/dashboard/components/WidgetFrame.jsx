function WidgetFrame({ title, children, editable, onRemove }) {
  return (
    <div className="h-full flex flex-col bg-ui-card dark:bg-ui-dark-card rounded-2xl border border-ui-border dark:border-ui-dark-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-ui-border-l dark:border-ui-dark-border">
        <span className="text-sm font-semibold text-text-primary dark:text-text-dark-primary truncate">
          {title}
        </span>
        {editable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Eliminar widget"
            className="ml-2 shrink-0 text-text-muted hover:text-danger dark:text-text-dark-secondary dark:hover:text-danger transition text-lg leading-none"
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
