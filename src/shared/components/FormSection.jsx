function FormSection({
  title,
  children,
  className = 'mb-6 p-5 rounded-lg border border-ui-border dark:border-ui-dark-border bg-ui-body dark:bg-ui-dark-card last:mb-0',
  titleClassName = 'm-0 mb-4 text-[0.95rem] font-semibold text-text-primary dark:text-text-dark-secondary',
}) {
  return (
    <div className={className}>
      {title && <h4 className={titleClassName}>{title}</h4>}
      {children}
    </div>
  )
}

export default FormSection
