function ToolsToggleButton({ showAll, onToggle }) {
  return (
    <button
      type="button"
      className="w-auto max-w-full py-2 sm:py-1.5 px-3.5 rounded-full border-none bg-odoo-primary text-gray-50 text-sm font-medium cursor-pointer shadow-[0_8px_16px_-10px_rgba(15,23,42,0.3),0_0_0_1px_rgba(148,163,184,0.35)] dark:shadow-none transition hover:bg-odoo-primary-hover hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-12px_rgba(15,23,42,0.4),0_0_0_1px_rgba(148,163,184,0.5)] dark:hover:shadow-none"
      onClick={onToggle}
    >
      {showAll ? 'Ver solo favoritas' : 'Ver todas las herramientas'}
    </button>
  )
}

export default ToolsToggleButton

