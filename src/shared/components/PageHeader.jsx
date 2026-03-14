function PageHeader({ title, subtitle, rightAction }) {
  return (
    <header className="max-w-[1200px] mx-auto mb-6 flex items-center justify-between">
      <div>
        <h2 className="mt-4 mb-1 text-[1.4rem] text-gray-900 dark:text-odoo-dark-text">{title}</h2>
        {subtitle && <p className="mb-4 text-[0.95rem] text-gray-500 dark:text-odoo-dark-muted">{subtitle}</p>}
      </div>

      {rightAction}
    </header>
  )
}

export default PageHeader