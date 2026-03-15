function PageHeader({ title, subtitle, rightAction }) {
  return (
    <header className="w-full mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="mt-2 sm:mt-4 mb-1 text-lg sm:text-[1.4rem] text-gray-900 dark:text-odoo-dark-text">{title}</h2>
        {subtitle && <p className="mb-0 sm:mb-4 text-sm sm:text-[0.95rem] text-gray-500 dark:text-odoo-dark-muted">{subtitle}</p>}
      </div>

      {rightAction && <div className="w-full sm:w-auto flex justify-center sm:justify-end flex-shrink-0">{rightAction}</div>}
    </header>
  )
}

export default PageHeader