function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  inputMode,
  pattern,
  rows,
  optionalLabel,
  inputClassName = 'form-input',
  invalidClassName = 'form-input-invalid',
  errorClassName = 'form-field-error',
  textareaClassName = 'form-textarea',
}) {
  const id = `error-${name}`
  const hasError = Boolean(error)
  const inputClasses = [inputClassName, hasError && invalidClassName].filter(Boolean).join(' ')
  const displayLabel = optionalLabel ? `${label} ${optionalLabel}` : label

  const commonProps = {
    id: name,
    name,
    value: value ?? '',
    onChange,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? id : undefined,
  }

  return (
    <label htmlFor={name}>
      {displayLabel}
      {type === 'textarea' ? (
        <textarea
          {...commonProps}
          rows={rows ?? 3}
          className={`${inputClasses} ${textareaClassName}`.trim()}
        />
      ) : (
        <input
          type={type}
          {...commonProps}
          className={inputClasses}
          placeholder={placeholder}
          inputMode={inputMode}
          pattern={pattern}
        />
      )}
      {error && (
        <span id={id} className={errorClassName} role="alert">
          {error}
        </span>
      )}
    </label>
  )
}

export default FormField
