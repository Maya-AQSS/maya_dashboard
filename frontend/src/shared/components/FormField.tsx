import { forwardRef } from 'react'

const inputBase =
  'py-2 px-3 border border-ui-border dark:border-ui-dark-border rounded-lg text-[0.9rem] bg-ui-card dark:bg-ui-dark-card text-text-primary dark:text-text-dark-primary placeholder:text-text-secondary dark:placeholder:text-text-dark-secondary focus:outline-none focus:border-odoo-purple dark:focus:border-odoo-purple focus:ring-1 focus:ring-odoo-purple/25'
const inputInvalid =
  'border-danger dark:border-danger/80 bg-danger-light dark:bg-danger-dark/40 focus:border-danger dark:focus:border-danger/80 focus:ring-danger/25'
const errorText = 'text-[0.8rem] text-danger dark:text-danger'
const textareaExtra = 'resize-y min-h-16'

const FormField = forwardRef(function FormField(
  {
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
    inputClassName,
    invalidClassName,
    errorClassName,
    textareaClassName,
    autoComplete,
    required,
  },
  ref,
) {

  const id = `error-${name}`
  const hasError = Boolean(error)

  const inputClasses = [
    inputClassName ?? inputBase,
    hasError && (invalidClassName ?? inputInvalid),
  ]
    .filter(Boolean)
    .join(' ')

  const displayLabel = optionalLabel ? `${label} ${optionalLabel}` : label

  const commonProps = {
    ref,
    id: name,
    name,
    value: value ?? '',
    onChange,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? id : undefined,
    autoComplete,
    required,
  }

  return (
    <label htmlFor={name} className="flex flex-col gap-1 text-sm font-medium text-text-primary dark:text-text-dark-secondary">
      {displayLabel}
      {type === 'textarea' ? (
        <textarea
          {...commonProps}
          rows={rows ?? 3}
          className={`${inputClasses} ${textareaClassName ?? textareaExtra}`.trim()}
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
        <span id={id} className={errorClassName ?? errorText} role="alert">
          {error}
        </span>
      )}
    </label>
  )
})

export default FormField
