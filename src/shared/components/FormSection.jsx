function FormSection({
  title,
  children,
  className = 'mb-6 p-5 rounded-lg border border-gray-200 dark:border-odoo-dark-border bg-gray-50 dark:bg-odoo-dark-surface last:mb-0',
  titleClassName = 'm-0 mb-4 text-[0.95rem] font-semibold text-gray-700 dark:text-odoo-dark-muted',
}) {
  return (
    <div className={className}>
      {title && <h4 className={titleClassName}>{title}</h4>}
      {children}
    </div>
  )
}

export default FormSection
