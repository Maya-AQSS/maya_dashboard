function FormSection({ title, children, className = 'form-section', titleClassName }) {
  return (
    <div className={className}>
      {title && (
        <h4 className={titleClassName}>{title}</h4>
      )}
      {children}
    </div>
  )
}

export default FormSection
